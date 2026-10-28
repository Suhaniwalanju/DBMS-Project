from datetime import date, timedelta, datetime
from decimal import Decimal
from app.database import SessionLocal, Base, engine
from app import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(models.Medicine).first():
        print("Database already contains data. Skipping seeding.")
        db.close()
        return

    print("Seeding initial pharmacy data...")

    # 1. Categories
    cat_names = [
        ("Pain Relief & Analgesics", "Medications used to relieve pain and reduce inflammation"),
        ("Antibiotics & Antimicrobials", "Drugs used to treat bacterial infections"),
        ("Cardiovascular & Heart", "Medications for blood pressure, cholesterol, and heart health"),
        ("Respiratory & Anti-Allergy", "Treatments for asthma, cough, allergies, and cold"),
        ("Gastrointestinal", "Medications for acid reflux, ulcers, and digestion"),
        ("Vitamins & Supplements", "Essential dietary vitamins, minerals, and boosters"),
        ("Dermatology & Skin Care", "Topical ointments, antiseptics, and skin care"),
    ]
    categories = {}
    for name, desc in cat_names:
        c = models.Category(name=name, description=desc)
        db.add(c)
        db.flush()
        categories[name] = c

    # 2. Suppliers
    suppliers_data = [
        {
            "name": "Apex LifeSciences Ltd.",
            "contact_person": "Dr. Ronald Harris",
            "phone": "+1-800-555-0199",
            "email": "supply@apexlifesciences.com",
            "address": "450 Pharma Park, Boston, MA"
        },
        {
            "name": "HealthLine Distributors",
            "contact_person": "Karen Vance",
            "phone": "+1-800-555-0244",
            "email": "orders@healthlinedist.com",
            "address": "12 Logistics Blvd, Chicago, IL"
        },
        {
            "name": "MediCare Global Supply",
            "contact_person": "David Miller",
            "phone": "+1-800-555-0371",
            "email": "contact@medicareglobal.com",
            "address": "88 Horizon Way, San Diego, CA"
        }
    ]
    suppliers = []
    for s_data in suppliers_data:
        s = models.Supplier(**s_data)
        db.add(s)
        db.flush()
        suppliers.append(s)

    # 3. Customers
    customers_data = [
        {"full_name": "Eleanor Vance", "phone": "+1-555-0101", "email": "eleanor.vance@example.com", "address": "742 Evergreen Terrace"},
        {"full_name": "Marcus Wright", "phone": "+1-555-0145", "email": "marcus.w@example.com", "address": "100 Pine Street"},
        {"full_name": "Sophia Martinez", "phone": "+1-555-0189", "email": "sophia.m@example.com", "address": "404 Elm Avenue"},
        {"full_name": "David Kim", "phone": "+1-555-0233", "email": "david.kim@example.com", "address": "12 Maple Drive"},
    ]
    customers = []
    for c_data in customers_data:
        c = models.Customer(**c_data)
        db.add(c)
        db.flush()
        customers.append(c)

    # 4. Medicines
    today = date.today()
    medicines_data = [
        {
            "name": "Paracetamol 500mg (Panadol)",
            "generic_name": "Acetaminophen",
            "category": categories["Pain Relief & Analgesics"],
            "supplier": suppliers[0],
            "batch_number": "BATCH-PAN-902",
            "expiry_date": today + timedelta(days=400),
            "unit_price": Decimal("4.50"),
            "cost_price": Decimal("2.10"),
            "stock_quantity": 180,
            "reorder_level": 30,
        },
        {
            "name": "Amoxicillin 500mg (Amoxil)",
            "generic_name": "Amoxicillin Trihydrate",
            "category": categories["Antibiotics & Antimicrobials"],
            "supplier": suppliers[1],
            "batch_number": "BATCH-AMX-441",
            "expiry_date": today + timedelta(days=250),
            "unit_price": Decimal("14.25"),
            "cost_price": Decimal("8.00"),
            "stock_quantity": 65,
            "reorder_level": 20,
        },
        {
            "name": "Atorvastatin 20mg (Lipitor)",
            "generic_name": "Atorvastatin Calcium",
            "category": categories["Cardiovascular & Heart"],
            "supplier": suppliers[2],
            "batch_number": "BATCH-LIP-108",
            "expiry_date": today + timedelta(days=25), # Expiring soon!
            "unit_price": Decimal("22.50"),
            "cost_price": Decimal("13.00"),
            "stock_quantity": 40,
            "reorder_level": 15,
        },
        {
            "name": "Metformin 500mg (Glucophage)",
            "generic_name": "Metformin Hydrochloride",
            "category": categories["Cardiovascular & Heart"],
            "supplier": suppliers[0],
            "batch_number": "BATCH-MET-772",
            "expiry_date": today + timedelta(days=360),
            "unit_price": Decimal("8.75"),
            "cost_price": Decimal("4.20"),
            "stock_quantity": 120,
            "reorder_level": 25,
        },
        {
            "name": "Cetirizine 10mg (Zyrtec)",
            "generic_name": "Cetirizine Dihydrochloride",
            "category": categories["Respiratory & Anti-Allergy"],
            "supplier": suppliers[1],
            "batch_number": "BATCH-ZYR-309",
            "expiry_date": today + timedelta(days=500),
            "unit_price": Decimal("11.00"),
            "cost_price": Decimal("5.50"),
            "stock_quantity": 8, # Low stock!
            "reorder_level": 20,
        },
        {
            "name": "Omeprazole 20mg (Prilosec)",
            "generic_name": "Omeprazole",
            "category": categories["Gastrointestinal"],
            "supplier": suppliers[2],
            "batch_number": "BATCH-OME-551",
            "expiry_date": today + timedelta(days=180),
            "unit_price": Decimal("16.80"),
            "cost_price": Decimal("9.50"),
            "stock_quantity": 5, # Low stock!
            "reorder_level": 15,
        },
        {
            "name": "Vitamin C 1000mg + Zinc",
            "generic_name": "Ascorbic Acid + Zinc Gluconate",
            "category": categories["Vitamins & Supplements"],
            "supplier": suppliers[0],
            "batch_number": "BATCH-VTC-889",
            "expiry_date": today + timedelta(days=45), # Expiring soon!
            "unit_price": Decimal("12.00"),
            "cost_price": Decimal("6.00"),
            "stock_quantity": 90,
            "reorder_level": 25,
        },
        {
            "name": "Ibuprofen 400mg (Advil)",
            "generic_name": "Ibuprofen",
            "category": categories["Pain Relief & Analgesics"],
            "supplier": suppliers[1],
            "batch_number": "BATCH-IBU-602",
            "expiry_date": today + timedelta(days=320),
            "unit_price": Decimal("6.50"),
            "cost_price": Decimal("3.10"),
            "stock_quantity": 140,
            "reorder_level": 30,
        },
        {
            "name": "Hydrocortisone 1% Cream",
            "generic_name": "Hydrocortisone",
            "category": categories["Dermatology & Skin Care"],
            "supplier": suppliers[2],
            "batch_number": "BATCH-HYD-014",
            "expiry_date": today - timedelta(days=10), # Expired!
            "unit_price": Decimal("9.90"),
            "cost_price": Decimal("4.80"),
            "stock_quantity": 12,
            "reorder_level": 10,
        },
        {
            "name": "Azithromycin 250mg (Zithromax)",
            "generic_name": "Azithromycin",
            "category": categories["Antibiotics & Antimicrobials"],
            "supplier": suppliers[0],
            "batch_number": "BATCH-AZI-229",
            "expiry_date": today + timedelta(days=280),
            "unit_price": Decimal("24.00"),
            "cost_price": Decimal("14.50"),
            "stock_quantity": 3, # Urgent Low Stock!
            "reorder_level": 15,
        }
    ]

    medicines = []
    for m_data in medicines_data:
        m = models.Medicine(
            name=m_data["name"],
            generic_name=m_data["generic_name"],
            category_id=m_data["category"].category_id,
            supplier_id=m_data["supplier"].supplier_id,
            batch_number=m_data["batch_number"],
            expiry_date=m_data["expiry_date"],
            unit_price=m_data["unit_price"],
            cost_price=m_data["cost_price"],
            stock_quantity=m_data["stock_quantity"],
            reorder_level=m_data["reorder_level"],
        )
        db.add(m)
        db.flush()
        medicines.append(m)

    # 5. Seed an Initial Sale
    sale1 = models.Sale(
        customer_id=customers[0].customer_id,
        total_amount=Decimal("37.25"),
        discount=Decimal("2.25"),
        tax=Decimal("1.75"),
        final_amount=Decimal("36.75"),
        payment_method="CASH",
        status="COMPLETED",
        notes="Regular patient prescription refilled"
    )
    db.add(sale1)
    db.flush()

    item1 = models.SaleItem(
        sale_id=sale1.sale_id,
        medicine_id=medicines[0].medicine_id,
        quantity=2,
        unit_price=medicines[0].unit_price,
        subtotal=Decimal("9.00")
    )
    item2 = models.SaleItem(
        sale_id=sale1.sale_id,
        medicine_id=medicines[1].medicine_id,
        quantity=2,
        unit_price=medicines[1].unit_price,
        subtotal=Decimal("28.25")
    )
    db.add_all([item1, item2])

    sale2 = models.Sale(
        customer_id=customers[1].customer_id,
        total_amount=Decimal("22.50"),
        discount=Decimal("0.00"),
        tax=Decimal("1.10"),
        final_amount=Decimal("23.60"),
        payment_method="CARD",
        status="COMPLETED",
        notes="Card payment confirmed"
    )
    db.add(sale2)
    db.flush()

    item3 = models.SaleItem(
        sale_id=sale2.sale_id,
        medicine_id=medicines[2].medicine_id,
        quantity=1,
        unit_price=medicines[2].unit_price,
        subtotal=Decimal("22.50")
    )
    db.add(item3)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
