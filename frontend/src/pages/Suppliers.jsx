import React, { useState, useEffect } from "react";
import { Building2, Phone, Mail, MapPin, Tag, Plus, Trash2 } from "lucide-react";
import { api } from "../services/api";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Supplier state
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supForm, setSupForm] = useState({ name: "", contact_person: "", phone: "", email: "", address: "" });

  // New Category state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sups, cats] = await Promise.all([api.getSuppliers(), api.getCategories()]);
      setSuppliers(sups);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load suppliers/categories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await api.createSupplier(supForm);
      setShowSupplierModal(false);
      setSupForm({ name: "", contact_person: "", phone: "", email: "", address: "" });
      loadData();
    } catch (err) {
      alert("Failed to add supplier: " + err.message);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory(catForm);
      setShowCategoryModal(false);
      setCatForm({ name: "", description: "" });
      loadData();
    } catch (err) {
      alert("Failed to add category: " + err.message);
    }
  };

  return (
    <div className="page-content">
      {/* Suppliers Section */}
      <div className="surface-panel">
        <div className="panel-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Building2 size={20} color="#38bdf8" />
            <h3 className="panel-title">Wholesale Distributors & Suppliers ({suppliers.length})</h3>
          </div>
          <button className="btn-primary" onClick={() => setShowSupplierModal(true)}>
            <Plus size={16} />
            <span>Add Supplier</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "16px" }}>
          {suppliers.map((sup) => (
            <div
              key={sup.supplier_id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ fontWeight: "700", fontSize: "1rem", color: "#f8fafc" }}>{sup.name}</div>
              <div style={{ fontSize: "0.82rem", color: "#38bdf8", fontWeight: "600" }}>
                Rep: {sup.contact_person || "General Accounts"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem", color: "#94a3b8" }}>
                {sup.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Phone size={14} color="#64748b" />
                    <span>{sup.phone}</span>
                  </div>
                )}
                {sup.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Mail size={14} color="#64748b" />
                    <span>{sup.email}</span>
                  </div>
                )}
                {sup.address && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin size={14} color="#64748b" />
                    <span>{sup.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="surface-panel">
        <div className="panel-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Tag size={20} color="#34d399" />
            <h3 className="panel-title">Medicine Therapeutic Classifications ({categories.length})</h3>
          </div>
          <button className="btn-secondary" onClick={() => setShowCategoryModal(true)}>
            <Plus size={16} />
            <span>Add Classification</span>
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {categories.map((cat) => (
            <div
              key={cat.category_id}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "16px",
              }}
            >
              <div style={{ fontWeight: "600", fontSize: "0.95rem", color: "#f8fafc", marginBottom: "4px" }}>
                {cat.name}
              </div>
              <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                {cat.description || "No description provided."}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="modal-overlay" onClick={() => setShowSupplierModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Wholesaler</h3>
            </div>
            <form onSubmit={handleCreateSupplier} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="input-group">
                <label className="input-label">Supplier / Company Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={supForm.name}
                  onChange={(e) => setSupForm({ ...supForm, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Contact Person</label>
                <input
                  type="text"
                  className="form-input"
                  value={supForm.contact_person}
                  onChange={(e) => setSupForm({ ...supForm, contact_person: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="input-group">
                  <label className="input-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={supForm.phone}
                    onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={supForm.email}
                    onChange={(e) => setSupForm({ ...supForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={supForm.address}
                  onChange={(e) => setSupForm({ ...supForm, address: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowSupplierModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Drug Category</h3>
            </div>
            <form onSubmit={handleCreateCategory} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="input-group">
                <label className="input-label">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hormones & Endocrine"
                  className="form-input"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Medical scope and indications..."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCategoryModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
