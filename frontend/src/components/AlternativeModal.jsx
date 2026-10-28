import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  Package,
  Plus,
  ArrowRight,
  Info
} from "lucide-react";
import { api } from "../services/api";

export default function AlternativeModal({ isOpen, medicine, onClose, onSelectAlternative }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && medicine?.medicine_id) {
      loadAlternatives(medicine.medicine_id);
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, medicine]);

  const loadAlternatives = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAlternatives(id);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch alternatives", err);
      setError(err.message || "Failed to load alternative suggestions");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: "680px", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                Alternative Medicine Recommendation
              </h3>
              <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0 }}>
                Clinically Verified Bioequivalent & Therapeutic Substitutes
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Unavailable Drug Banner */}
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: "var(--radius-sm)",
            padding: "14px 18px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <AlertOctagon size={20} color="#f87171" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)" }}>
                {medicine?.name}
              </span>
              <span className="badge badge-out_of_stock">
                Currently Out of Stock (0 units)
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "3px" }}>
              <strong>Active Generic Salt:</strong> {medicine?.generic_name || "Standard Formulation"}
            </p>
          </div>
        </div>

        {/* Clinical Research Guidance Note */}
        <div
          style={{
            background: "rgba(14, 165, 233, 0.08)",
            border: "1px solid rgba(14, 165, 233, 0.2)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
          }}
        >
          <Info size={18} color="#0284c7" style={{ flexShrink: 0 }} />
          <span>
            Under pharmacy pharmacopeia research and drug substitution protocols, customers can be safely dispensed verified bioequivalent formulations containing the identical active salt and therapeutic dosage.
          </span>
        </div>

        {/* Alternatives List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={16} color="#10b981" />
              <span>Available In-Stock Substitutes ({data?.alternatives?.length || 0})</span>
            </h4>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
              <p>Analyzing generic formulation & verified substitutes...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#fb7185" }}>
              <p>{error}</p>
            </div>
          ) : !data?.alternatives || data.alternatives.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px 20px",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Package size={32} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "0.9rem" }}>
                No active in-stock substitutes found
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                There are currently no alternative medicines in stock sharing this generic salt or therapeutic classification. Please restock from the distributor.
              </p>
            </div>
          ) : (
            data.alternatives.map((alt) => {
              const isExact = alt.match_badge === "exact_generic";
              return (
                <div
                  key={alt.medicine_id}
                  style={{
                    background: "var(--bg-surface)",
                    border: isExact
                      ? "1px solid rgba(16, 185, 129, 0.35)"
                      : "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    position: "relative",
                    boxShadow: isExact ? "0 2px 10px rgba(16, 185, 129, 0.08)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text-main)" }}>
                          {alt.name}
                        </span>
                        <span
                          className="badge"
                          style={{
                            background: isExact ? "rgba(16, 185, 129, 0.15)" : "rgba(14, 165, 233, 0.15)",
                            color: isExact ? "#10b981" : "#0284c7",
                            border: isExact
                              ? "1px solid rgba(16, 185, 129, 0.3)"
                              : "1px solid rgba(14, 165, 233, 0.3)",
                            fontSize: "0.72rem",
                          }}
                        >
                          <CheckCircle2 size={12} />
                          {alt.match_type}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Active: <strong>{alt.generic_name || "Equivalent Salt"}</strong> • Distributor: {alt.supplier_name || "Licensed Wholesale"}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#0284c7", fontFamily: "var(--font-mono)" }}>
                        Rs. {parseFloat(alt.unit_price).toFixed(2)}
                      </div>
                      <span style={{ fontSize: "0.74rem", color: "#10b981", fontWeight: "600" }}>
                        {alt.stock_quantity} units available
                      </span>
                    </div>
                  </div>

                  {/* Research & Clinical Verification Note */}
                  <div
                    style={{
                      fontSize: "0.76rem",
                      color: isExact ? "var(--text-main)" : "var(--text-muted)",
                      background: isExact ? "rgba(16, 185, 129, 0.06)" : "rgba(0, 0, 0, 0.03)",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      lineHeight: "1.4",
                    }}
                  >
                    <strong>🔬 Clinical Verification:</strong> {alt.clinical_notes}
                  </div>

                  {/* Action Button */}
                  {onSelectAlternative && (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2px" }}>
                      <button
                        className="btn-primary"
                        style={{ padding: "8px 14px", fontSize: "0.82rem" }}
                        onClick={() => {
                          onSelectAlternative(alt);
                          onClose();
                        }}
                      >
                        <Plus size={15} />
                        <span>Select Alternative & Add to Cart</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
