import React, { useState, useEffect } from "react";
import { Search, Receipt, Printer, ExternalLink, Calendar } from "lucide-react";
import { api } from "../services/api";

export default function SalesHistory({ onOpenInvoice }) {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await api.getSales(100);
      setSales(data);
    } catch (err) {
      console.error("Failed to load sales history", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.sale_id.toString().includes(q) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
      (s.payment_method && s.payment_method.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-content">
      <div className="surface-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div className="search-box-wrap" style={{ width: "380px" }}>
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by Invoice # or Patient Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            Showing <strong>{filteredSales.length}</strong> transactions
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date & Time</th>
                <th>Patient / Customer</th>
                <th>Payment Mode</th>
                <th>Prescription Items</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Final Paid</th>
                <th style={{ textAlign: "right" }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No sales matching your search.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.sale_id}>
                    <td>
                      <code style={{ fontWeight: "700", color: "#38bdf8" }}>#{sale.sale_id}</code>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem" }}>
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                        {new Date(sale.sale_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: "600", color: "#f8fafc" }}>{sale.customer_name}</div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38bdf8", border: "1px solid rgba(14, 165, 233, 0.3)" }}>
                        {sale.payment_method}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                        {sale.items.length} line {sale.items.length === 1 ? "item" : "items"}
                      </span>
                    </td>
                    <td>Rs. {parseFloat(sale.total_amount).toFixed(2)}</td>
                    <td>
                      {parseFloat(sale.discount) > 0 ? (
                        <span style={{ color: "#34d399" }}>-Rs. {parseFloat(sale.discount).toFixed(2)}</span>
                      ) : (
                        "Rs. 0.00"
                      )}
                    </td>
                    <td>+Rs. {parseFloat(sale.tax).toFixed(2)}</td>
                    <td>
                      <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)", fontSize: "0.95rem" }}>
                        Rs. {parseFloat(sale.final_amount).toFixed(2)}
                      </strong>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                        onClick={() => onOpenInvoice(sale.sale_id)}
                      >
                        <Receipt size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
