import sys
from pathlib import Path

# Ensure parent directory is in sys.path when executed directly
_parent = str(Path(__file__).resolve().parent.parent)
if _parent not in sys.path:
    sys.path.insert(0, _parent)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.seed_data import seed_database
from app.routers import medicines, sales, customers, suppliers, categories, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed sample data
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Seed note: {e}")
    yield

app = FastAPI(
    title="PharmaCare - Pharmacy Management API",
    description="Clean, robust REST API for retail pharmacy inventory, billing, and analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(dashboard.router)
app.include_router(medicines.router)
app.include_router(sales.router)
app.include_router(customers.router)
app.include_router(suppliers.router)
app.include_router(categories.router)

@app.get("/")
def root():
    return {
        "system": "PharmaCare Pharmacy Management API",
        "status": "Online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    print("Starting PharmaCare Backend Server on http://127.0.0.1:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
