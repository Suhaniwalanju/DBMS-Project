from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/sales", tags=["Sales & Invoicing"])

@router.get("", response_model=List[schemas.SaleResponse])
def get_sales(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    sales = db.query(models.Sale).order_by(models.Sale.sale_date.desc()).limit(limit).all()
    results = []
    for sale in sales:
        items = [
            schemas.SaleItemResponse(
                sale_item_id=item.sale_item_id,
                medicine_id=item.medicine_id,
                medicine_name=item.medicine.name if item.medicine else "Unknown",
                batch_number=item.medicine.batch_number if item.medicine else "-",
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=item.subtotal,
            )
            for item in sale.items
        ]
        results.append(
            schemas.SaleResponse(
                sale_id=sale.sale_id,
                customer_id=sale.customer_id,
                customer_name=sale.customer.full_name if sale.customer else "Walk-in Customer",
                sale_date=sale.sale_date,
                total_amount=sale.total_amount,
                discount=sale.discount,
                tax=sale.tax,
                final_amount=sale.final_amount,
                payment_method=sale.payment_method,
                status=sale.status,
                notes=sale.notes,
                items=items,
            )
        )
    return results

@router.get("/{sale_id}", response_model=schemas.SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(models.Sale).filter(models.Sale.sale_id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale invoice not found")

    items = [
        schemas.SaleItemResponse(
            sale_item_id=item.sale_item_id,
            medicine_id=item.medicine_id,
            medicine_name=item.medicine.name if item.medicine else "Unknown",
            batch_number=item.medicine.batch_number if item.medicine else "-",
            quantity=item.quantity,
            unit_price=item.unit_price,
            subtotal=item.subtotal,
        )
        for item in sale.items
    ]
    return schemas.SaleResponse(
        sale_id=sale.sale_id,
        customer_id=sale.customer_id,
        customer_name=sale.customer.full_name if sale.customer else "Walk-in Customer",
        sale_date=sale.sale_date,
        total_amount=sale.total_amount,
        discount=sale.discount,
        tax=sale.tax,
        final_amount=sale.final_amount,
        payment_method=sale.payment_method,
        status=sale.status,
        notes=sale.notes,
        items=items,
    )

@router.post("", response_model=schemas.SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(sale_in: schemas.SaleCreate, db: Session = Depends(get_db)):
    if not sale_in.items:
        raise HTTPException(status_code=400, detail="Cannot create a sale without items")

    # Handle customer lookup or auto-creation
    customer_id = sale_in.customer_id
    if not customer_id and sale_in.customer_name and sale_in.customer_name.strip():
        # Quick create or find existing customer
        name_clean = sale_in.customer_name.strip()
        cust = db.query(models.Customer).filter(models.Customer.full_name.ilike(name_clean)).first()
        if not cust:
            cust = models.Customer(
                full_name=name_clean,
                phone=sale_in.customer_phone.strip() if sale_in.customer_phone else None
            )
            db.add(cust)
            db.flush()
        customer_id = cust.customer_id

    # Verify inventory and compute subtotals
    total_amount = Decimal("0.00")
    prepared_items = []

    for item in sale_in.items:
        med = db.query(models.Medicine).filter(models.Medicine.medicine_id == item.medicine_id).with_for_update().first()
        if not med:
            db.rollback()
            raise HTTPException(status_code=404, detail=f"Medicine ID {item.medicine_id} not found")

        if med.stock_quantity < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{med.name}'. Requested: {item.quantity}, Available: {med.stock_quantity}"
            )

        # Deduct stock
        med.stock_quantity -= item.quantity

        item_subtotal = Decimal(str(med.unit_price)) * Decimal(str(item.quantity))
        total_amount += item_subtotal

        prepared_items.append({
            "medicine": med,
            "quantity": item.quantity,
            "unit_price": med.unit_price,
            "subtotal": item_subtotal,
        })

    discount = Decimal(str(sale_in.discount or 0))
    tax = Decimal(str(sale_in.tax or 0))
    final_amount = max(Decimal("0.00"), total_amount - discount + tax)

    # Create sale record
    sale_record = models.Sale(
        customer_id=customer_id,
        total_amount=total_amount,
        discount=discount,
        tax=tax,
        final_amount=final_amount,
        payment_method=sale_in.payment_method.upper(),
        status="COMPLETED",
        notes=sale_in.notes
    )
    db.add(sale_record)
    db.flush()

    # Create sale items
    response_items = []
    for p in prepared_items:
        sale_item = models.SaleItem(
            sale_id=sale_record.sale_id,
            medicine_id=p["medicine"].medicine_id,
            quantity=p["quantity"],
            unit_price=p["unit_price"],
            subtotal=p["subtotal"]
        )
        db.add(sale_item)
        db.flush()

        response_items.append(
            schemas.SaleItemResponse(
                sale_item_id=sale_item.sale_item_id,
                medicine_id=p["medicine"].medicine_id,
                medicine_name=p["medicine"].name,
                batch_number=p["medicine"].batch_number,
                quantity=p["quantity"],
                unit_price=p["unit_price"],
                subtotal=p["subtotal"]
            )
        )

    db.commit()
    db.refresh(sale_record)

    customer_name = "Walk-in Customer"
    if sale_record.customer:
        customer_name = sale_record.customer.full_name

    return schemas.SaleResponse(
        sale_id=sale_record.sale_id,
        customer_id=sale_record.customer_id,
        customer_name=customer_name,
        sale_date=sale_record.sale_date,
        total_amount=sale_record.total_amount,
        discount=sale_record.discount,
        tax=sale_record.tax,
        final_amount=sale_record.final_amount,
        payment_method=sale_record.payment_method,
        status=sale_record.status,
        notes=sale_record.notes,
        items=response_items
    )
