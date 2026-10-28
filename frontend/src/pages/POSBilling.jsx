import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Check,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  Receipt,
  Sparkles
} from "lucide-react";
import { api } from "../services/api";
import AlternativeModal from "../components/AlternativeModal";

export default function POSBilling({ onSaleCompleted, dataVersion }) {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5);
  const [notes, setNotes] = useState("");

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [selectedOutMedicine, setSelectedOutMedicine] = useState(null);

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, dataVersion]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [meds, cats, custs] = await Promise.all([
        api.getMedicines({
          search: search.trim() || undefined,
          category_id: selectedCategory ? parseInt(selectedCategory) : undefined,
        }),
        api.getCategories(),
        api.getCustomers(),
      ]);
      setMedicines(meds);
      setCategories(cats);
      setCustomers(custs);
    } catch (err) {
      console.error("Failed to load POS data", err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (med) => {
    if (med.stock_quantity <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.medicine_id === med.medicine_id);
      if (existing) {
        if (existing.quantity >= med.stock_quantity) {
          alert(`Cannot add more. Max available stock is ${med.stock_quantity}`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.medicine_id === med.medicine_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            medicine_id: med.medicine_id,
            name: med.name,
            batch_number: med.batch_number,
            unit_price: parseFloat(med.unit_price),
            stock_quantity: med.stock_quantity,
            quantity: 1,
          },
        ];
      }
    });
  };

  const updateQuantity = (medicine_id, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.medicine_id === medicine_id) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock_quantity) {
              alert(`Maximum available stock reached (${item.stock_quantity})`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (medicine_id) => {
    setCart((prevCart) => prevCart.filter((item) => item.medicine_id !== medicine_id));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setSelectedCustomerId("");
    setDiscountAmount(0);
    setNotes("");
    setCheckoutError(null);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  const discount = Math.min(subtotal, Math.max(0, parseFloat(discountAmount) || 0));
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * ((parseFloat(taxPercent) || 0) / 100);
  const finalTotal = taxableAmount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const payload = {
        customer_id: selectedCustomerId ? parseInt(selectedCustomerId) : null,
        customer_name: !selectedCustomerId && customerName.trim() ? customerName.trim() : null,
        customer_phone: !selectedCustomerId && customerPhone.trim() ? customerPhone.trim() : null,
        payment_method: paymentMethod,
        discount: discount,
        tax: tax,
        notes: notes.trim() || null,
        items: cart.map((item) => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
        })),
      };

      const result = await api.createSale(payload);
      clearCart();
      loadData();
      if (onSaleCompleted) {
        onSaleCompleted(result);
      }
    } catch (err) {
      setCheckoutError(err.message || "Failed to process sale. Check stock levels.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="pos-layout">
        {/* Left Column: Medicine Catalog */}
        <div className="pos-catalog">
          {/* Search and Category Filter Bar */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div className="search-box-wrap" style={{ flex: 1 }}>
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search drug by brand, generic name, or batch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: "220px" }}
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
          </div>

          {/* Medicines Grid */}
          <div className="medicine-cards-grid">
            {medicines.map((med) => {
              const inCart = cart.find((c) => c.medicine_id === med.medicine_id);
              const isOut = med.stock_quantity <= 0;
              return (
                <div
                  key={med.medicine_id}
                  className={`medicine-item-card ${isOut ? "out-of-stock" : ""}`}
                  onClick={() => isOut ? setSelectedOutMedicine(med) : addToCart(med)}
                  style={isOut ? { cursor: "pointer" } : undefined}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="card-med-name">{med.name}</div>
                    <span className={`badge badge-${med.status}`}>{med.status.replace("_", " ")}</span>
                  </div>

                  <div className="card-generic-name">{med.generic_name || "Standard Formulation"}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Batch: {med.batch_number}</div>

                  <div className="card-price-stock">
                    <div>
                      <div className="med-price">Rs. {parseFloat(med.unit_price).toFixed(2)}</div>
                      <div className="med-stock" style={isOut ? { color: "#fb7185", fontWeight: "600" } : undefined}>
                        {isOut ? "Out of Stock" : `Stock: ${med.stock_quantity} left`}
                      </div>
                    </div>

                    {isOut ? (
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{
                          padding: "6px 10px",
                          fontSize: "0.75rem",
                          color: "#10b981",
                          borderColor: "rgba(16, 185, 129, 0.4)",
                          background: "rgba(16, 185, 129, 0.1)",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOutMedicine(med);
                        }}
                        title="Click to view research-verified in-stock alternatives"
                      >
                        <Sparkles size={13} />
                        <span>Suggest Alt</span>
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(med);
                        }}
                      >
                        {inCart ? `In Cart (${inCart.quantity})` : "+ Add"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: POS Cart & Checkout */}
        <div className="pos-cart-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShoppingCart size={20} color="#38bdf8" />
              <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>Current Order</h3>
            </div>
            {cart.length > 0 && (
              <button
                style={{ background: "none", border: "none", color: "#fb7185", cursor: "pointer", fontSize: "0.8rem" }}
                onClick={clearCart}
              >
                Clear Cart
              </button>
            )}
          </div>

          {checkoutError && (
            <div style={{
              background: "rgba(244, 63, 94, 0.15)",
              border: "1px solid rgba(244, 63, 94, 0.3)",
              color: "#fb7185",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <AlertCircle size={16} />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
              <ShoppingCart size={40} strokeWidth={1.5} style={{ margin: "0 auto 8px" }} />
              <p>Cart is empty</p>
              <p style={{ fontSize: "0.75rem" }}>Click any medicine from the left to add</p>
            </div>
          ) : (
            <div className="cart-items-scroll">
              {cart.map((item) => (
                <div key={item.medicine_id} className="cart-row">
                  <div style={{ flex: 1, paddingRight: "8px" }}>
                    <div style={{ fontWeight: "600", fontSize: "0.86rem" }}>{item.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      Rs. {item.unit_price.toFixed(2)} each
                    </div>
                  </div>

                  <div className="cart-qty-controls">
                    <button className="btn-qty" onClick={() => updateQuantity(item.medicine_id, -1)}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: "0.88rem", fontWeight: "700", minWidth: "20px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button className="btn-qty" onClick={() => updateQuantity(item.medicine_id, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>

                  <div style={{ minWidth: "60px", textAlign: "right", fontWeight: "700", color: "#38bdf8", fontSize: "0.88rem", fontFamily: "var(--font-mono)" }}>
                    Rs. {(item.unit_price * item.quantity).toFixed(2)}
                  </div>

                  <button
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginLeft: "8px" }}
                    onClick={() => removeFromCart(item.medicine_id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Customer Selection */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <label className="input-label">Customer / Patient</label>
            <select
              className="form-select"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Walk-in Patient (New / Unregistered)</option>
              {customers.map((c) => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.full_name} ({c.phone || "No phone"})
                </option>
              ))}
            </select>

            {!selectedCustomerId && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Patient Name"
                  className="form-input"
                  style={{ fontSize: "0.82rem" }}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  className="form-input"
                  style={{ fontSize: "0.82rem" }}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#94a3b8" }}>
              <span>Subtotal:</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "#94a3b8" }}>Discount (Rs.):</span>
              <input
                type="number"
                min="0"
                step="0.5"
                style={{ width: "80px", textAlign: "right", padding: "4px 8px" }}
                className="form-input"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
              <span style={{ color: "#94a3b8" }}>Tax (%):</span>
              <input
                type="number"
                min="0"
                max="50"
                style={{ width: "80px", textAlign: "right", padding: "4px 8px" }}
                className="form-input"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
              />
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.25rem",
              fontWeight: "800",
              color: "var(--text-main)",
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "8px"
            }}>
              <span>Total:</span>
              <span style={{ color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                Rs. {finalTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[
              { id: "CASH", label: "Cash", icon: Banknote },
              { id: "CARD", label: "Card", icon: CreditCard },
              { id: "UPI", label: "UPI", icon: QrCode },
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = paymentMethod === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentMethod(p.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                    padding: "8px",
                    borderRadius: "8px",
                    border: isSelected ? "1px solid #0ea5e9" : "1px solid var(--border-subtle)",
                    background: isSelected ? "rgba(14, 165, 233, 0.15)" : "var(--bg-surface)",
                    color: isSelected ? "#38bdf8" : "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                  }}
                >
                  <Icon size={18} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Checkout Button */}
          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1rem" }}
            disabled={cart.length === 0 || checkoutLoading}
            onClick={handleCheckout}
          >
            <Receipt size={18} />
            <span>{checkoutLoading ? "Processing Transaction..." : `Charge Rs. ${finalTotal.toFixed(2)}`}</span>
          </button>
        </div>
      </div>

      {/* Clinically Verified Alternative Medicine Modal */}
      <AlternativeModal
        isOpen={!!selectedOutMedicine}
        medicine={selectedOutMedicine}
        onClose={() => setSelectedOutMedicine(null)}
        onSelectAlternative={(alt) => addToCart(alt)}
      />
    </div>
  );
}
