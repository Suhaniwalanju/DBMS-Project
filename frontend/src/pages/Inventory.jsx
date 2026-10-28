import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Package,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";
import AlternativeModal from "../components/AlternativeModal";

export default function Inventory({ onOpenAddModal, onEditMedicine, dataVersion }) {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAltMedicine, setSelectedAltMedicine] = useState(null);

  useEffect(() => {
    loadInventory();
  }, [search, selectedCategory, selectedStatus, dataVersion]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [meds, cats] = await Promise.all([
        api.getMedicines({
          search: search.trim() || undefined,
          category_id: selectedCategory ? parseInt(selectedCategory) : undefined,
          status_filter: selectedStatus || undefined,
        }),
        api.getCategories(),
      ]);
      setMedicines(meds);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load inventory", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStock = async (medicine, delta) => {
    const newQty = Math.max(0, medicine.stock_quantity + delta);
    try {
      await api.updateMedicine(medicine.medicine_id, { stock_quantity: newQty });
      setMedicines((prev) =>
        prev.map((m) =>
          m.medicine_id === medicine.medicine_id ? { ...m, stock_quantity: newQty } : m
        )
      );
    } catch (err) {
      alert("Failed to adjust stock: " + err.message);
    }
  };

  const handleDelete = async (medicine_id, name) => {
    if (!window.confirm(`Are you sure you want to delete '${name}' from inventory?`)) return;
    try {
      await api.deleteMedicine(medicine_id);
      loadInventory();
    } catch (err) {
      alert("Failed to delete medicine: " + err.message);
    }
  };

  return (
    <div className="page-content">
      <div className="surface-panel">
        {/* Controls Bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "300px" }}>
            <div className="search-box-wrap" style={{ flex: 1 }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search by brand name, active ingredient, or batch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: "200px" }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: "170px" }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <button className="btn-primary" onClick={onOpenAddModal}>
            <Plus size={18} />
            <span>Add New Drug</span>
          </button>
        </div>

        {/* Medicines Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Drug & Chemical</th>
                <th>Category</th>
                <th>Batch #</th>
                <th>Expiry Date</th>
                <th>Selling Price</th>
                <th>Cost Price</th>
                <th>Stock Units</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                medicines.map((med) => (
                  <tr key={med.medicine_id}>
                    <td>
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{med.name}</div>
                      <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>{med.generic_name || "N/A"}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "#cbd5e1" }}>
                        {med.category_name || "Uncategorized"}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: "0.8rem", color: "#38bdf8" }}>{med.batch_number}</code>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem" }}>{med.expiry_date}</span>
                    </td>
                    <td>
                      <strong style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                        Rs. {parseFloat(med.unit_price).toFixed(2)}
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: "#94a3b8", fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
                        Rs. {parseFloat(med.cost_price).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "700", minWidth: "28px" }}>{med.stock_quantity}</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <button
                            title="Quick add 5 units"
                            className="btn-qty"
                            style={{ width: "20px", height: "16px", fontSize: "10px" }}
                            onClick={() => handleQuickStock(med, 5)}
                          >
                            +5
                          </button>
                          <button
                            title="Quick remove 1 unit"
                            className="btn-qty"
                            style={{ width: "20px", height: "16px", fontSize: "10px" }}
                            onClick={() => handleQuickStock(med, -1)}
                          >
                            -1
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${med.status}`}>
                        {med.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        {med.stock_quantity <= 0 && (
                          <button
                            className="btn-secondary"
                            style={{
                              padding: "6px 10px",
                              color: "#10b981",
                              borderColor: "rgba(16, 185, 129, 0.4)",
                              background: "rgba(16, 185, 129, 0.1)",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                            title="View Research-Verified In-Stock Alternatives"
                            onClick={() => setSelectedAltMedicine(med)}
                          >
                            <Sparkles size={13} />
                            <span>Suggest Alt</span>
                          </button>
                        )}
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px" }}
                          title="Edit Medicine"
                          onClick={() => onEditMedicine(med)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: "6px", color: "#fb7185" }}
                          title="Delete Medicine"
                          onClick={() => handleDelete(med.medicine_id, med.name)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alternative Medicine Modal */}
      <AlternativeModal
        isOpen={!!selectedAltMedicine}
        medicine={selectedAltMedicine}
        onClose={() => setSelectedAltMedicine(null)}
      />
    </div>
  );
}
