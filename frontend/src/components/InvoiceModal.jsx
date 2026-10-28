import React from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";

export default function InvoiceModal({ sale, onClose }) {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.sale_date).toLocaleString();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: "560px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={20} color="#10b981" />
            <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>Receipt / Invoice #{sale.sale_id}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Receipt Canvas */}
        <div className="receipt-paper" id="printable-receipt" style={{ marginBottom: "20px" }}>
          <div style={{ textAlign: "center", borderBottom: "2px dashed #cbd5e1", paddingBottom: "12px", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", margin: "0" }}>PHARMACARE</h2>
            <p style={{ fontSize: "0.8rem", color: "#475569" }}>Licensed Retail Pharmacy & Healthcare Chemist</p>
            <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Tel: +91 98200-PHARMA | GSTIN: 27AABCP1234F1Z5</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#334155", marginBottom: "14px" }}>
            <div>
              <p><strong>Invoice ID:</strong> #{sale.sale_id}</p>
              <p><strong>Customer:</strong> {sale.customer_name || "Walk-in Patient"}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p><strong>Date:</strong> {formattedDate}</p>
              <p><strong>Method:</strong> {sale.payment_method}</p>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", marginBottom: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #94a3b8", textAlign: "left", color: "#1e293b" }}>
                <th style={{ padding: "6px 0" }}>Item</th>
                <th style={{ padding: "6px 0", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "6px 0", textAlign: "right" }}>Price</th>
                <th style={{ padding: "6px 0", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px dashed #e2e8f0" }}>
                  <td style={{ padding: "8px 0" }}>
                    <div style={{ fontWeight: "600" }}>{item.medicine_name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Batch: {item.batch_number}</div>
                  </td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>Rs. {parseFloat(item.unit_price).toFixed(2)}</td>
                  <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "600" }}>
                    Rs. {parseFloat(item.subtotal).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "8px", fontSize: "0.84rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
              <span>Subtotal:</span>
              <span>Rs. {parseFloat(sale.total_amount).toFixed(2)}</span>
            </div>
            {parseFloat(sale.discount) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: "#16a34a" }}>
                <span>Discount:</span>
                <span>-Rs. {parseFloat(sale.discount).toFixed(2)}</span>
              </div>
            )}
            {parseFloat(sale.tax) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                <span>Tax:</span>
                <span>+Rs. {parseFloat(sale.tax).toFixed(2)}</span>
              </div>
            )}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              fontWeight: "800",
              fontSize: "1.1rem",
              borderTop: "2px solid #0f172a",
              marginTop: "6px"
            }}>
              <span>Final Total Paid:</span>
              <span style={{ color: "#0284c7" }}>Rs. {parseFloat(sale.final_amount).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.75rem", color: "#64748b" }}>
            <p>Thank you for trusting PharmaCare!</p>
            <p>Please consult a pharmacist if you experience any adverse reactions.</p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
