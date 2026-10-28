from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

# ----------------- Category Schemas -----------------
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    category_id: int
    model_config = ConfigDict(from_attributes=True)


# ----------------- Supplier Schemas -----------------
class SupplierBase(BaseModel):
    name: str = Field(..., max_length=150)
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    supplier_id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# ----------------- Customer Schemas -----------------
class CustomerBase(BaseModel):
    full_name: str = Field(..., max_length=120)
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    customer_id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


# ----------------- Medicine Schemas -----------------
class MedicineBase(BaseModel):
    name: str = Field(..., max_length=150)
    generic_name: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    batch_number: str = Field(..., max_length=60)
    expiry_date: date
    unit_price: Decimal = Field(..., ge=0)
    cost_price: Decimal = Field(..., ge=0)
    stock_quantity: int = Field(0, ge=0)
    reorder_level: int = Field(10, ge=0)

class MedicineCreate(MedicineBase):
    pass

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    generic_name: Optional[str] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None
    unit_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    reorder_level: Optional[int] = None

class MedicineResponse(MedicineBase):
    medicine_id: int
    created_at: Optional[datetime] = None
    category_name: Optional[str] = None
    supplier_name: Optional[str] = None
    status: Optional[str] = None  # "in_stock", "low_stock", "out_of_stock", "expired", "expiring_soon"

    model_config = ConfigDict(from_attributes=True)


# ----------------- Sale Item & Sale Schemas -----------------
class SaleItemCreate(BaseModel):
    medicine_id: int
    quantity: int = Field(..., gt=0)

class SaleItemResponse(BaseModel):
    sale_item_id: int
    medicine_id: int
    medicine_name: Optional[str] = None
    batch_number: Optional[str] = None
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    model_config = ConfigDict(from_attributes=True)

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None  # Optional quick-add
    customer_phone: Optional[str] = None
    payment_method: str = "CASH"
    discount: Decimal = Decimal("0.00")
    tax: Decimal = Decimal("0.00")
    notes: Optional[str] = None
    items: List[SaleItemCreate]

class SaleResponse(BaseModel):
    sale_id: int
    customer_id: Optional[int] = None
    customer_name: Optional[str] = None
    sale_date: datetime
    total_amount: Decimal
    discount: Decimal
    tax: Decimal
    final_amount: Decimal
    payment_method: str
    status: str
    notes: Optional[str] = None
    items: List[SaleItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ----------------- Dashboard Analytics -----------------
class DashboardStats(BaseModel):
    total_medicines: int
    total_customers: int
    total_sales_count: int
    total_revenue: Decimal
    today_revenue: Decimal
    today_sales_count: int
    low_stock_count: int
    expiring_soon_count: int
    expired_count: int
