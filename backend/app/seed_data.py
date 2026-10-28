from datetime import date, timedelta, datetime
from decimal import Decimal
from app.database import SessionLocal, Base, engine
from app import models

def seed_database(force_refresh: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if not force_refresh and db.query(models.Medicine).count() >= 10:
        # Check if already has Indian data
        has_indian = db.query(models.Customer).filter(models.Customer.full_name.ilike("%Rajesh Sharma%")).first()
        if has_indian:
            print("Database already contains Indian pharmacy data. Skipping seeding.")
            db.close()
            return

    print("Seeding authentic Indian pharmacy data...")

    # If force_refresh, clear existing tables in proper order
    if force_refresh:
        db.query(models.SaleItem).delete()
        db.query(models.Sale).delete()
        db.query(models.Medicine).delete()
        db.query(models.Customer).delete()
        db.query(models.Supplier).delete()
        db.query(models.Category).delete()
        db.commit()

    # 1. Categories (Therapeutic Classifications)
    cat_definitions = [
        ("Analgesics & Antipyretics (Pain & Fever)", "Medications used to relieve pain, headache, and reduce fever like Paracetamol & NSAIDs"),
        ("Antibiotics & Antimicrobials", "Broad-spectrum antibacterial, antiprotozoal, and prescription antibiotic medications"),
        ("Cardiovascular & Antihypertensives", "Prescription drugs for high blood pressure, cholesterol, and cardiovascular health"),
        ("Antidiabetic & Metabolic Regulators", "Oral hypoglycemic agents and blood glucose regulating medications"),
        ("Gastrointestinal & Antacids", "Treatments for hyperacidity, acid reflux, peptic ulcers, and gastrointestinal relief"),
        ("Antiallergic & Respiratory", "Antihistamines, cough syrups, and bronchodilators for allergies and respiratory conditions"),
        ("Vitamins, Minerals & Supplements", "Essential daily vitamins, B-complex, zinc supplements, and immunity boosters"),
        ("Dermatologicals & Antiseptics", "Topical ointments, povidone iodine, healing creams, and antiseptic skin solutions"),
    ]

    categories = {}
    for name, desc in cat_definitions:
        existing_cat = db.query(models.Category).filter(models.Category.name == name).first()
        if not existing_cat:
            c = models.Category(name=name, description=desc)
            db.add(c)
            db.flush()
            categories[name] = c
        else:
            categories[name] = existing_cat

    # 2. Suppliers (Indian Pharmaceutical Distributors)
    suppliers_data = [
        {
            "name": "Sun Pharma Laboratories Ltd.",
            "contact_person": "Rajesh Kulkarni",
            "phone": "+91 98201 44521",
            "email": "supply@sunpharma.in",
            "address": "Goregaon East, Western Express Hwy, Mumbai, Maharashtra 400063"
        },
        {
            "name": "Cipla Healthcare Distribution",
            "contact_person": "Ananya Sen",
            "phone": "+91 98310 77124",
            "email": "orders@cipladist.com",
            "address": "Peninsula Business Park, Ganpatrao Kadam Marg, Lower Parel, Mumbai 400013"
        },
        {
            "name": "Dr. Reddy's Laboratories Distributors",
            "contact_person": "Suresh Nair",
            "phone": "+91 94402 11890",
            "email": "sales@drreddys.co.in",
            "address": "Road No. 3, Banjara Hills, Hyderabad, Telangana 500034"
        },
        {
            "name": "Mankind Pharma Logistics",
            "contact_person": "Neha Gupta",
            "phone": "+91 98110 33456",
            "email": "contact@mankindlogistics.in",
            "address": "208 Okhla Industrial Area Phase III, New Delhi 110020"
        }
    ]

    suppliers = []
    for s_data in suppliers_data:
        existing_sup = db.query(models.Supplier).filter(models.Supplier.name == s_data["name"]).first()
        if not existing_sup:
            s = models.Supplier(**s_data)
            db.add(s)
            db.flush()
            suppliers.append(s)
        else:
            suppliers.append(existing_sup)

    # 3. Customers (Indian Patients & Walk-in Clients)
    customers_data = [
        {
            "full_name": "Rajesh Sharma",
            "phone": "+91 98210 55432",
            "email": "rajesh.sharma@gmail.com",
            "address": "Flat 402, Shanti Heights, Dadar West, Mumbai"
        },
        {
            "full_name": "Priya Patel",
            "phone": "+91 97120 33451",
            "email": "priya.patel@yahoo.co.in",
            "address": "12 Navrang Society, CG Road, Ahmedabad"
        },
        {
            "full_name": "Amit Verma",
            "phone": "+91 98101 22345",
            "email": "amit.verma@outlook.com",
            "address": "B-45 Sector 18, Noida, Uttar Pradesh"
        },
        {
            "full_name": "Sunita Deshmukh",
            "phone": "+91 99220 88712",
            "email": "sunita.d@rediffmail.com",
            "address": "78 Model Colony, Shivajinagar, Pune"
        },
        {
            "full_name": "Vikram Rao",
            "phone": "+91 98450 66789",
            "email": "vikram.rao@gmail.com",
            "address": "21 Indiranagar 100ft Road, Bengaluru"
        }
    ]

    customers = []
    for c_data in customers_data:
        existing_cust = db.query(models.Customer).filter(models.Customer.full_name == c_data["full_name"]).first()
        if not existing_cust:
            c = models.Customer(**c_data)
            db.add(c)
            db.flush()
            customers.append(c)
        else:
            customers.append(existing_cust)

    # 4. Medicines (10 Authentic Indian Drug Brands with Rupee Pricing)
    today = date.today()
    medicines_data = [
        {
            "name": "Dolo 650mg Tablet",
            "generic_name": "Paracetamol 650mg",
            "category_name": "Analgesics & Antipyretics (Pain & Fever)",
            "supplier_index": 0,  # Sun Pharma
            "batch_number": "DLO-24901",
            "expiry_date": today + timedelta(days=420),
            "unit_price": Decimal("32.50"),
            "cost_price": Decimal("20.00"),
            "stock_quantity": 160,
            "reorder_level": 30,
        },
        {
            "name": "Augmentin 625 Duo Tablet",
            "generic_name": "Amoxicillin (500mg) + Potassium Clavulanate (125mg)",
            "category_name": "Antibiotics & Antimicrobials",
            "supplier_index": 1,  # Cipla
            "batch_number": "AUG-88120",
            "expiry_date": today + timedelta(days=280),
            "unit_price": Decimal("205.00"),
            "cost_price": Decimal("150.00"),
            "stock_quantity": 45,
            "reorder_level": 15,
        },
        {
            "name": "Pan 40mg Tablet",
            "generic_name": "Pantoprazole Sodium 40mg",
            "category_name": "Gastrointestinal & Antacids",
            "supplier_index": 0,  # Sun Pharma
            "batch_number": "PAN-77402",
            "expiry_date": today + timedelta(days=360),
            "unit_price": Decimal("142.00"),
            "cost_price": Decimal("95.00"),
            "stock_quantity": 85,
            "reorder_level": 20,
        },
        {
            "name": "Glycomet 500 SR Tablet",
            "generic_name": "Metformin Hydrochloride Sustained Release 500mg",
            "category_name": "Antidiabetic & Metabolic Regulators",
            "supplier_index": 2,  # Dr. Reddy's
            "batch_number": "GLY-50119",
            "expiry_date": today + timedelta(days=300),
            "unit_price": Decimal("45.00"),
            "cost_price": Decimal("28.00"),
            "stock_quantity": 130,
            "reorder_level": 25,
        },
        {
            "name": "Telma 40mg Tablet",
            "generic_name": "Telmisartan 40mg",
            "category_name": "Cardiovascular & Antihypertensives",
            "supplier_index": 3,  # Mankind Pharma
            "batch_number": "TEL-30344",
            "expiry_date": today + timedelta(days=340),
            "unit_price": Decimal("118.00"),
            "cost_price": Decimal("78.00"),
            "stock_quantity": 70,
            "reorder_level": 15,
        },
        {
            "name": "Allegra 120mg Tablet",
            "generic_name": "Fexofenadine Hydrochloride 120mg",
            "category_name": "Antiallergic & Respiratory",
            "supplier_index": 1,  # Cipla
            "batch_number": "ALG-44912",
            "expiry_date": today + timedelta(days=450),
            "unit_price": Decimal("195.00"),
            "cost_price": Decimal("135.00"),
            "stock_quantity": 6,  # ⚠️ Low Stock Alert!
            "reorder_level": 15,
        },
        {
            "name": "Becosules Z Capsules",
            "generic_name": "Vitamin B-Complex Forte with Vitamin C and Zinc",
            "category_name": "Vitamins, Minerals & Supplements",
            "supplier_index": 0,  # Sun Pharma
            "batch_number": "BEC-90214",
            "expiry_date": today + timedelta(days=500),
            "unit_price": Decimal("54.00"),
            "cost_price": Decimal("35.00"),
            "stock_quantity": 110,
            "reorder_level": 25,
        },
        {
            "name": "Azithral 500mg Tablet",
            "generic_name": "Azithromycin 500mg",
            "category_name": "Antibiotics & Antimicrobials",
            "supplier_index": 2,  # Dr. Reddy's
            "batch_number": "AZT-10293",
            "expiry_date": today + timedelta(days=260),
            "unit_price": Decimal("128.00"),
            "cost_price": Decimal("84.00"),
            "stock_quantity": 4,  # ⚠️ Urgent Low Stock Alert!
            "reorder_level": 12,
        },
        {
            "name": "Atorva 10mg Tablet",
            "generic_name": "Atorvastatin Calcium 10mg",
            "category_name": "Cardiovascular & Antihypertensives",
            "supplier_index": 3,  # Mankind Pharma
            "batch_number": "ATR-66108",
            "expiry_date": today + timedelta(days=22),  # ⚠️ Expiring Soon Alert!
            "unit_price": Decimal("92.00"),
            "cost_price": Decimal("60.00"),
            "stock_quantity": 38,
            "reorder_level": 15,
        },
        {
            "name": "Betadine 10% Antiseptic Ointment 20g",
            "generic_name": "Povidone Iodine 10% w/w",
            "category_name": "Dermatologicals & Antiseptics",
            "supplier_index": 1,  # Cipla
            "batch_number": "BET-55031",
            "expiry_date": today + timedelta(days=320),
            "unit_price": Decimal("72.00"),
            "cost_price": Decimal("46.00"),
            "stock_quantity": 45,
            "reorder_level": 10,
        }
    ]

    medicines = []
    for m_data in medicines_data:
        existing_med = db.query(models.Medicine).filter(models.Medicine.name == m_data["name"]).first()
        if not existing_med:
            cat = categories.get(m_data["category_name"])
            sup = suppliers[m_data["supplier_index"]]
            m = models.Medicine(
                name=m_data["name"],
                generic_name=m_data["generic_name"],
                category_id=cat.category_id if cat else None,
                supplier_id=sup.supplier_id if sup else None,
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
        else:
            medicines.append(existing_med)

    # 5. Completed Sales & Invoices with Line Items (Indian Patients & Rupees)
    if len(customers) >= 3 and len(medicines) >= 8:
        # Sale 1: Rajesh Sharma
        sale1 = models.Sale(
            customer_id=customers[0].customer_id,
            total_amount=Decimal("412.00"),
            discount=Decimal("20.00"),
            tax=Decimal("19.60"),
            final_amount=Decimal("411.60"),
            payment_method="CASH",
            status="COMPLETED",
            notes="Regular prescription filled - Cash received"
        )
        db.add(sale1)
        db.flush()

        item1_1 = models.SaleItem(
            sale_id=sale1.sale_id,
            medicine_id=medicines[0].medicine_id,  # Dolo 650mg
            quantity=2,
            unit_price=Decimal("32.50"),
            subtotal=Decimal("65.00")
        )
        item1_2 = models.SaleItem(
            sale_id=sale1.sale_id,
            medicine_id=medicines[1].medicine_id,  # Augmentin 625
            quantity=1,
            unit_price=Decimal("205.00"),
            subtotal=Decimal("205.00")
        )
        item1_3 = models.SaleItem(
            sale_id=sale1.sale_id,
            medicine_id=medicines[2].medicine_id,  # Pan 40mg
            quantity=1,
            unit_price=Decimal("142.00"),
            subtotal=Decimal("142.00")
        )
        db.add_all([item1_1, item1_2, item1_3])

        # Sale 2: Priya Patel
        sale2 = models.Sale(
            customer_id=customers[1].customer_id,
            total_amount=Decimal("425.00"),
            discount=Decimal("25.00"),
            tax=Decimal("20.00"),
            final_amount=Decimal("420.00"),
            payment_method="UPI",
            status="COMPLETED",
            notes="Paid via PhonePe / Google Pay UPI"
        )
        db.add(sale2)
        db.flush()

        item2_1 = models.SaleItem(
            sale_id=sale2.sale_id,
            medicine_id=medicines[3].medicine_id,  # Glycomet 500
            quantity=3,
            unit_price=Decimal("45.00"),
            subtotal=Decimal("135.00")
        )
        item2_2 = models.SaleItem(
            sale_id=sale2.sale_id,
            medicine_id=medicines[4].medicine_id,  # Telma 40
            quantity=2,
            unit_price=Decimal("118.00"),
            subtotal=Decimal("236.00")
        )
        item2_3 = models.SaleItem(
            sale_id=sale2.sale_id,
            medicine_id=medicines[6].medicine_id,  # Becosules Z
            quantity=1,
            unit_price=Decimal("54.00"),
            subtotal=Decimal("54.00")
        )
        db.add_all([item2_1, item2_2, item2_3])

        # Sale 3: Amit Verma
        sale3 = models.Sale(
            customer_id=customers[2].customer_id,
            total_amount=Decimal("267.00"),
            discount=Decimal("0.00"),
            tax=Decimal("13.35"),
            final_amount=Decimal("280.35"),
            payment_method="CARD",
            status="COMPLETED",
            notes="HDFC Bank Debit Card swiped"
        )
        db.add(sale3)
        db.flush()

        item3_1 = models.SaleItem(
            sale_id=sale3.sale_id,
            medicine_id=medicines[5].medicine_id,  # Allegra 120
            quantity=1,
            unit_price=Decimal("195.00"),
            subtotal=Decimal("195.00")
        )
        item3_2 = models.SaleItem(
            sale_id=sale3.sale_id,
            medicine_id=medicines[9].medicine_id,  # Betadine Ointment
            quantity=1,
            unit_price=Decimal("72.00"),
            subtotal=Decimal("72.00")
        )
        db.add_all([item3_1, item3_2])

    db.commit()
    db.close()
    print("Indian pharmacy sample data successfully seeded into PostgreSQL!")

if __name__ == "__main__":
    import sys
    force = "--reset" in sys.argv or "-r" in sys.argv
    seed_database(force_refresh=force)
