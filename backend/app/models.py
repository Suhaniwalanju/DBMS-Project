from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Category(Base):
    __tablename__ = "categories"

    category_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    medicines = relationship("Medicine", back_populates="category")


class Supplier(Base):
    __tablename__ = "suppliers"

    supplier_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    contact_person = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    medicines = relationship("Medicine", back_populates="supplier")


class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False, index=True)
    phone = Column(String(30), nullable=True, index=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sales = relationship("Sale", back_populates="customer")


class Medicine(Base):
    __tablename__ = "medicines"

    medicine_id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.category_id", ondelete="SET NULL"), nullable=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.supplier_id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False, index=True)
    generic_name = Column(String(150), nullable=True, index=True)
    batch_number = Column(String(60), nullable=False)
    expiry_date = Column(Date, nullable=False, index=True)
    unit_price = Column(Numeric(10, 2), nullable=False)
    cost_price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=10)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("unit_price >= 0", name="chk_unit_price_positive"),
        CheckConstraint("cost_price >= 0", name="chk_cost_price_positive"),
        CheckConstraint("stock_quantity >= 0", name="chk_stock_quantity_non_negative"),
        CheckConstraint("reorder_level >= 0", name="chk_reorder_level_non_negative"),
    )

    category = relationship("Category", back_populates="medicines")
    supplier = relationship("Supplier", back_populates="medicines")
    sale_items = relationship("SaleItem", back_populates="medicine")


class Sale(Base):
    __tablename__ = "sales"

    sale_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.customer_id", ondelete="SET NULL"), nullable=True)
    sale_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    discount = Column(Numeric(10, 2), nullable=False, default=0.00)
    tax = Column(Numeric(10, 2), nullable=False, default=0.00)
    final_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    payment_method = Column(String(30), nullable=False, default="CASH")
    status = Column(String(20), nullable=False, default="COMPLETED")
    notes = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    __tablename__ = "sale_items"

    sale_item_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.sale_id", ondelete="CASCADE"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.medicine_id", ondelete="RESTRICT"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_sale_item_quantity_positive"),
    )

    sale = relationship("Sale", back_populates="items")
    medicine = relationship("Medicine", back_populates="sale_items")
