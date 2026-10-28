from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("", response_model=List[schemas.CustomerResponse])
def get_customers(
    search: Optional[str] = Query(None, description="Search by name, phone, or email"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Customer)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Customer.full_name.ilike(search_filter)) |
            (models.Customer.phone.ilike(search_filter)) |
            (models.Customer.email.ilike(search_filter))
        )
    return query.order_by(models.Customer.full_name).all()

@router.post("", response_model=schemas.CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: schemas.CustomerCreate, db: Session = Depends(get_db)):
    cust = models.Customer(**customer_in.model_dump())
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust

@router.get("/{customer_id}", response_model=schemas.CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    cust = db.query(models.Customer).filter(models.Customer.customer_id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    return cust
