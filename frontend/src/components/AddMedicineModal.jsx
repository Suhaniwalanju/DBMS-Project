import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { api } from "../services/api";

export default function AddMedicineModal({ isOpen, onClose, onSaved, initialData = null }) {
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    category_id: "",
    supplier_id: "",
    batch_number: "",
    expiry_date: "",
    unit_price: "",
    cost_price: "",
    stock_quantity: 50,
    reorder_level: 15,
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          generic_name: initialData.generic_name || "",
          category_id: initialData.category_id || "",
          supplier_id: initialData.supplier_id || "",
          batch_number: initialData.batch_number || "",
          expiry_date: initialData.expiry_date || "",
          unit_price: initialData.unit_price || "",
          cost_price: initialData.cost_price || "",
          stock_quantity: initialData.stock_quantity ?? 50,
          reorder_level: initialData.reorder_level ?? 15,
        });
      } else {
        // default batch code
        setFormData({
          name: "",
          generic_name: "",
          category_id: "",
          supplier_id: "",
          batch_number: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
          expiry_date: "",
          unit_price: "",
          cost_price: "",
          stock_quantity: 50,
          reorder_level: 15,
        });
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  const loadDropdowns = async () => {
    try {
      const [cats, sups] = await Promise.all([api.getCategories(), api.getSuppliers()]);
      setCategories(cats);
      setSuppliers(sups);
    } catch (err) {
      console.error("Failed to load categories/suppliers", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        generic_name: formData.generic_name.trim() || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
        batch_number: formData.batch_number.trim(),
        expiry_date: formData.expiry_date,
        unit_price: parseFloat(formData.unit_price),
        cost_price: parseFloat(formData.cost_price),
        stock_quantity: parseInt(formData.stock_quantity),
        reorder_level: parseInt(formData.reorder_level),
      };

      if (initialData?.medicine_id) {
        await api.updateMedicine(initialData.medicine_id, payload);
      } else {
        await api.createMedicine(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save medicine");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>
            {initialData ? "Edit Medicine Details" : "Add New Medicine to Stock"}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fb7185",
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="input-group">
            <label className="input-label">Medicine Brand Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Augmentin 625mg"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Generic / Chemical Name</label>
            <input
              type="text"
              name="generic_name"
              placeholder="e.g. Amoxicillin + Clavulanic Acid"
              className="form-input"
              value={formData.generic_name}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                name="category_id"
                className="form-select"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Supplier / Distributor</label>
              <select
                name="supplier_id"
                className="form-select"
                value={formData.supplier_id}
                onChange={handleChange}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.supplier_id} value={s.supplier_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="input-group">
              <label className="input-label">Batch Number *</label>
              <input
                type="text"
                name="batch_number"
                required
                className="form-input"
                value={formData.batch_number}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Expiry Date *</label>
              <input
                type="date"
                name="expiry_date"
                required
                className="form-input"
                value={formData.expiry_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="input-group">
              <label className="input-label">Selling Unit Price (Rs.) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="unit_price"
                required
                placeholder="0.00"
                className="form-input"
                value={formData.unit_price}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Cost Purchase Price (Rs.) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="cost_price"
                required
                placeholder="0.00"
                className="form-input"
                value={formData.cost_price}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div className="input-group">
              <label className="input-label">Initial Stock Quantity *</label>
              <input
                type="number"
                min="0"
                name="stock_quantity"
                required
                className="form-input"
                value={formData.stock_quantity}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Reorder Alert Level *</label>
              <input
                type="number"
                min="0"
                name="reorder_level"
                required
                className="form-input"
                value={formData.reorder_level}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? "Saving..." : initialData ? "Update Medicine" : "Save to Inventory"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
