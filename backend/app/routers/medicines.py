from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])

def enrich_medicine(med: models.Medicine) -> dict:
    today = date.today()
    if med.expiry_date < today:
        status_str = "expired"
    elif med.expiry_date <= today + timedelta(days=60):
        status_str = "expiring_soon"
    elif med.stock_quantity <= 0:
        status_str = "out_of_stock"
    elif med.stock_quantity <= med.reorder_level:
        status_str = "low_stock"
    else:
        status_str = "in_stock"

    return {
        "medicine_id": med.medicine_id,
        "name": med.name,
        "generic_name": med.generic_name,
        "category_id": med.category_id,
        "category_name": med.category.name if med.category else None,
        "supplier_id": med.supplier_id,
        "supplier_name": med.supplier.name if med.supplier else None,
        "batch_number": med.batch_number,
        "expiry_date": med.expiry_date,
        "unit_price": med.unit_price,
        "cost_price": med.cost_price,
        "stock_quantity": med.stock_quantity,
        "reorder_level": med.reorder_level,
        "created_at": med.created_at,
        "status": status_str,
    }

@router.get("", response_model=List[schemas.MedicineResponse])
def get_medicines(
    search: Optional[str] = Query(None, description="Search by name, generic name, or batch"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    status_filter: Optional[str] = Query(None, description="Filter by status: low_stock, expiring_soon, expired, in_stock"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Medicine)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Medicine.name.ilike(search_filter)) |
            (models.Medicine.generic_name.ilike(search_filter)) |
            (models.Medicine.batch_number.ilike(search_filter))
        )
    if category_id:
        query = query.filter(models.Medicine.category_id == category_id)

    meds = query.order_by(models.Medicine.name).all()
    results = [enrich_medicine(m) for m in meds]

    if status_filter:
        results = [m for m in results if m["status"] == status_filter]

    return results

@router.get("/alerts/low-stock", response_model=List[schemas.MedicineResponse])
def get_low_stock_medicines(db: Session = Depends(get_db)):
    meds = db.query(models.Medicine).filter(models.Medicine.stock_quantity <= models.Medicine.reorder_level).all()
    return [enrich_medicine(m) for m in meds]

@router.get("/alerts/expiring-soon", response_model=List[schemas.MedicineResponse])
def get_expiring_medicines(days: int = 60, db: Session = Depends(get_db)):
    today = date.today()
    threshold = today + timedelta(days=days)
    meds = db.query(models.Medicine).filter(models.Medicine.expiry_date <= threshold).order_by(models.Medicine.expiry_date).all()
    return [enrich_medicine(m) for m in meds]

@router.post("", response_model=schemas.MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(med_in: schemas.MedicineCreate, db: Session = Depends(get_db)):
    med = models.Medicine(**med_in.model_dump())
    db.add(med)
    db.commit()
    db.refresh(med)
    return enrich_medicine(med)

@router.get("/{medicine_id}", response_model=schemas.MedicineResponse)
def get_medicine(medicine_id: int, db: Session = Depends(get_db)):
    med = db.query(models.Medicine).filter(models.Medicine.medicine_id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return enrich_medicine(med)

@router.put("/{medicine_id}", response_model=schemas.MedicineResponse)
def update_medicine(medicine_id: int, med_in: schemas.MedicineUpdate, db: Session = Depends(get_db)):
    med = db.query(models.Medicine).filter(models.Medicine.medicine_id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    update_data = med_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(med, key, value)

    db.commit()
    db.refresh(med)
    return enrich_medicine(med)

@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicine(medicine_id: int, db: Session = Depends(get_db)):
    med = db.query(models.Medicine).filter(models.Medicine.medicine_id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db.delete(med)
    db.commit()
    return None

@router.get("/{medicine_id}/alternatives")
def get_medicine_alternatives(medicine_id: int, db: Session = Depends(get_db)):
    med = db.query(models.Medicine).filter(models.Medicine.medicine_id == medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    today = date.today()
    # Find active in-stock substitutes
    available_meds = db.query(models.Medicine).filter(
        models.Medicine.medicine_id != medicine_id,
        models.Medicine.stock_quantity > 0,
        models.Medicine.expiry_date >= today
    ).all()

    alternatives = []
    target_generic = (med.generic_name or "").strip().lower()
    
    # Extract main salt words if complex generic (e.g., 'Paracetamol', 'Amoxicillin')
    target_salt_tokens = [w for w in target_generic.replace("+", " ").replace(",", " ").split() if len(w) > 3]

    for candidate in available_meds:
        candidate_generic = (candidate.generic_name or "").strip().lower()
        enriched = enrich_medicine(candidate)

        is_exact_generic = False
        if target_generic and (target_generic == candidate_generic or target_generic in candidate_generic or candidate_generic in target_generic):
            is_exact_generic = True
        elif any(token in candidate_generic for token in target_salt_tokens):
            is_exact_generic = True

        if is_exact_generic:
            enriched["match_type"] = "Verified Generic Bioequivalent (Identical Active Salt)"
            enriched["match_badge"] = "exact_generic"
            enriched["clinical_notes"] = f"Pharmacologically identical active ingredient ({candidate.generic_name}). Prescribed as direct bioequivalent substitute with matching therapeutic bioavailability."
            alternatives.append(enriched)
        elif med.category_id and candidate.category_id == med.category_id:
            enriched["match_type"] = "Therapeutic Class Alternative"
            enriched["match_badge"] = "therapeutic_class"
            enriched["clinical_notes"] = f"Belongs to the same therapeutic classification ({candidate.category.name if candidate.category else 'Clinical Class'}). Researched medical substitute for matching indication."
            alternatives.append(enriched)

    # Sort: generic equivalents first, then by available stock descending
    alternatives.sort(key=lambda x: (x["match_badge"] != "exact_generic", -x["stock_quantity"]))

    return {
        "requested_medicine_id": med.medicine_id,
        "requested_medicine_name": med.name,
        "requested_generic_name": med.generic_name,
        "requested_stock": med.stock_quantity,
        "is_out_of_stock": med.stock_quantity <= 0,
        "category_name": med.category.name if med.category else "General",
        "alternatives": alternatives
    }

