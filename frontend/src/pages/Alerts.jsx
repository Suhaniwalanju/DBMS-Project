import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Package,
  Calendar,
  CheckCircle2,
  Plus
} from "lucide-react";
import { api } from "../services/api";

export default function Alerts({ onEditMedicine, onOpenAddModal }) {
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [expiringMeds, setExpiringMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const [lowStock, expiring] = await Promise.all([
        api.getLowStockAlerts(),
        api.getExpiringAlerts(60),
      ]);
      setLowStockMeds(lowStock);
      setExpiringMeds(expiring);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async (med, addedUnits = 30) => {
    try {
      const newStock = med.stock_quantity + addedUnits;
      await api.updateMedicine(med.medicine_id, { stock_quantity: newStock });
      loadAlerts();
    } catch (err) {
      alert("Failed to restock: " + err.message);
    }
  };

  return (
    <div className="page-content">
      {/* Top Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(245, 158, 11, 0.1))",
        border: "1px solid rgba(244, 63, 94, 0.3)",
        borderRadius: "var(--radius-md)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ShieldAlert size={32} color="#fb7185" />
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
              Pharmaceutical Safety & Expiration Guard
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
              Dispensing expired medications or running out of critical life-saving antibiotics violates pharmacy protocols.
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>New Stock Batch</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Low Stock & Shortages */}
        <div className="surface-panel">
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Package size={20} color="#fbbf24" />
              <h3 className="panel-title">Low Stock Shortages ({lowStockMeds.length})</h3>
            </div>
          </div>

          {lowStockMeds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 8px" }} />
              <p>No low-stock alerts! All inventory above thresholds.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {lowStockMeds.map((med) => (
                <div
                  key={med.medicine_id}
                  style={{
                    padding: "14px",
                    background: "var(--bg-surface)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.92rem", color: "#f8fafc" }}>{med.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                      Category: {med.category_name || "General"} • Batch: {med.batch_number}
                    </div>
                    <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>
                      Remaining: <strong style={{ color: "#fb7185" }}>{med.stock_quantity} units</strong> (Min: {med.reorder_level})
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button
                      className="btn-primary"
                      style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                      onClick={() => handleRestock(med, 25)}
                    >
                      + Quick Restock 25
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "0.74rem" }}
                      onClick={() => onEditMedicine(med)}
                    >
                      Edit Threshold
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Alerts */}
        <div className="surface-panel">
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={20} color="#fb7185" />
              <h3 className="panel-title">Expiry Warnings & Recalls ({expiringMeds.length})</h3>
            </div>
          </div>

          {expiringMeds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 8px" }} />
              <p>No medicines expiring in the next 60 days!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {expiringMeds.map((med) => {
                const isPast = new Date(med.expiry_date) < new Date();
                return (
                  <div
                    key={med.medicine_id}
                    style={{
                      padding: "14px",
                      background: isPast ? "rgba(239, 68, 68, 0.08)" : "var(--bg-surface)",
                      borderRadius: "8px",
                      border: isPast ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "600", fontSize: "0.92rem", color: "#f8fafc" }}>{med.name}</span>
                        <span className={`badge badge-${med.status}`}>
                          {isPast ? "Expired" : "Expiring Soon"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
                        Batch: {med.batch_number} • Supplier: {med.supplier_name || "Direct Wholesale"}
                      </div>
                      <div style={{ fontSize: "0.8rem", marginTop: "4px", color: isPast ? "#f87171" : "#fbbf24" }}>
                        Expiry Date: <strong>{med.expiry_date}</strong> ({med.stock_quantity} units remaining in stock)
                      </div>
                    </div>

                    <button
                      className="btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                      onClick={() => onEditMedicine(med)}
                    >
                      Update Batch
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
