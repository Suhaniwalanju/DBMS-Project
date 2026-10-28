from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])

@router.get("", response_model=List[schemas.SupplierResponse])
def get_suppliers(db: Session = Depends(get_db)):
    return db.query(models.Supplier).order_by(models.Supplier.name).all()

@router.post("", response_model=schemas.SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(supplier_in: schemas.SupplierCreate, db: Session = Depends(get_db)):
    sup = models.Supplier(**supplier_in.model_dump())
    db.add(sup)
    db.commit()
    db.refresh(sup)
    return sup

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    sup = db.query(models.Supplier).filter(models.Supplier.supplier_id == supplier_id).first()
    if not sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    db.delete(sup)
    db.commit()
    return None
