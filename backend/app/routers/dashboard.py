from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    today = date.today()
    today_start = datetime.combine(today, time.min)
    expiring_threshold = today + timedelta(days=60)

    total_medicines = db.query(func.count(models.Medicine.medicine_id)).scalar() or 0
    total_customers = db.query(func.count(models.Customer.customer_id)).scalar() or 0
    total_sales_count = db.query(func.count(models.Sale.sale_id)).scalar() or 0
    total_revenue = db.query(func.sum(models.Sale.final_amount)).scalar() or Decimal("0.00")

    today_sales_query = db.query(
        func.count(models.Sale.sale_id),
        func.sum(models.Sale.final_amount)
    ).filter(models.Sale.sale_date >= today_start).first()

    today_sales_count = today_sales_query[0] or 0
    today_revenue = today_sales_query[1] or Decimal("0.00")

    low_stock_count = db.query(func.count(models.Medicine.medicine_id)).filter(
        models.Medicine.stock_quantity <= models.Medicine.reorder_level
    ).scalar() or 0

    expiring_soon_count = db.query(func.count(models.Medicine.medicine_id)).filter(
        models.Medicine.expiry_date >= today,
        models.Medicine.expiry_date <= expiring_threshold
    ).scalar() or 0

    expired_count = db.query(func.count(models.Medicine.medicine_id)).filter(
        models.Medicine.expiry_date < today
    ).scalar() or 0

    return schemas.DashboardStats(
        total_medicines=total_medicines,
        total_customers=total_customers,
        total_sales_count=total_sales_count,
        total_revenue=total_revenue,
        today_revenue=today_revenue,
        today_sales_count=today_sales_count,
        low_stock_count=low_stock_count,
        expiring_soon_count=expiring_soon_count,
        expired_count=expired_count,
    )

@router.get("/recent-activity")
def get_recent_activity(db: Session = Depends(get_db)):
    recent_sales = db.query(models.Sale).order_by(models.Sale.sale_date.desc()).limit(5).all()
    sales_data = [
        {
            "sale_id": s.sale_id,
            "customer_name": s.customer.full_name if s.customer else "Walk-in Customer",
            "sale_date": s.sale_date,
            "final_amount": float(s.final_amount),
            "payment_method": s.payment_method,
            "items_count": len(s.items)
        }
        for s in recent_sales
    ]
    return {"recent_sales": sales_data}
