# 🏥 PharmaCare — Pharmacy Management System

A modern, high-performance Pharmacy Management System featuring a **React.js** web interface with medical-tech aesthetics, a **Python FastAPI** backend, and a relational **PostgreSQL** database.

---

## 🌟 Key Features

1. **Executive Dashboard**:
   - Live revenue metrics (Today's Revenue, Lifetime Sales, In-Stock Drugs, Stock & Expiry Alerts).
   - Urgent Attention feed for low stock and expiring batches.
   - Recent invoices and real-time synchronized clock.

2. **Point of Sale (POS / Billing)**:
   - Live medicine search and category filters.
   - Instant cart management with dynamic quantity increment/decrement.
   - Patient / customer selector or quick walk-in entry.
   - Tax and discount calculations.
   - Payment method toggle: Cash, Card, UPI.
   - **Atomic Stock Deduction**: Automatically decreases PostgreSQL inventory units inside an ACID transaction upon checkout.
   - **Printable Receipt**: Generates a clean, professional pharmacy invoice ready to print (`window.print()`).

3. **Medicine Inventory**:
   - Filter by brand, generic active ingredient, batch number, category, or status.
   - Inline quick-stock buttons (`+5`, `-1`) for instant inventory adjustments.
   - Add & Edit modal forms with full validation (batch, prices, expiry, reorder level).

4. **Safety & Expiry Center**:
   - Proactive warnings for medicines expiring within 60 days.
   - Highlighted alerts for out-of-stock and low-stock medications with 1-click restock actions.

5. **Sales & Invoice History**:
   - Audit trail of all completed sales, payment methods, and line-item breakdowns.

6. **Distributors & Catalog**:
   - Wholesale pharmaceutical supplier directory with contacts and addresses.
   - Therapeutic classifications manager.

---

## 🏗️ Architecture & Database

- **Database**: PostgreSQL 17 on `127.0.0.1:5432`, database: `pharmacy_db`
- **Backend**: Python 3.11 + FastAPI + SQLAlchemy 2.0 + psycopg2
- **Frontend**: React 18 + Vite + Lucide Icons + Pure CSS tokens & Glassmorphism

### Database Schema
- `categories`: `category_id`, `name`, `description`
- `suppliers`: `supplier_id`, `name`, `contact_person`, `phone`, `email`, `address`, `created_at`
- `medicines`: `medicine_id`, `category_id`, `supplier_id`, `name`, `generic_name`, `batch_number`, `expiry_date`, `unit_price`, `cost_price`, `stock_quantity`, `reorder_level`
- `customers`: `customer_id`, `full_name`, `phone`, `email`, `address`
- `sales`: `sale_id`, `customer_id`, `sale_date`, `total_amount`, `discount`, `tax`, `final_amount`, `payment_method`, `status`
- `sale_items`: `sale_item_id`, `sale_id`, `medicine_id`, `quantity`, `unit_price`, `subtotal`

---

## 🚀 How to Run Locally

### 1. Backend (FastAPI)
```bash
cd "d:\DBMS Project\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- API Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Frontend (React + Vite)
```bash
cd "d:\DBMS Project\frontend"
npm.cmd run dev -- --host 127.0.0.1 --port 3001
```
- Open in Browser: [http://127.0.0.1:3001/](http://127.0.0.1:3001/)

---

## 🔄 Re-seeding Sample Data
To reset or re-seed starter pharmacy medicines, categories, and distributors:
```bash
cd "d:\DBMS Project\backend"
python -m app.seed_data
```
