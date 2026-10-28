import React, { useState, useEffect } from "react";
import { Plus, Bell, RefreshCw, Sun, Moon } from "lucide-react";

export default function Header({ currentTab, onOpenAddMedicine, onQuickSale, onRefresh, theme, onToggleTheme }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const titles = {
    dashboard: { title: "Pharmacy Dashboard", subtitle: "Real-time overview of sales, stock alerts, and revenue" },
    pos: { title: "Point of Sale (POS)", subtitle: "Fast prescription billing and immediate checkout" },
    inventory: { title: "Medicine Inventory", subtitle: "Monitor drug stocks, prices, batches, and reorder levels" },
    alerts: { title: "Safety & Expiry Center", subtitle: "Critical warnings for near-expiry and low-stock medications" },
    sales: { title: "Sales & Invoices", subtitle: "Audit history of completed prescriptions and customer receipts" },
    suppliers: { title: "Suppliers & Categories", subtitle: "Wholesaler directories and pharmaceutical classifications" },
  };

  const currentInfo = titles[currentTab] || { title: "PharmaCare", subtitle: "Pharmacy Management" };

  return (
    <header className="top-header">
      <div className="header-title-wrap">
        <h2 className="page-title">{currentInfo.title}</h2>
        <span className="page-subtitle">{currentInfo.subtitle}</span>
      </div>

      <div className="header-actions">
        {/* Dark / Light Mode Switcher */}
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? <Moon size={16} color="#0284c7" /> : <Sun size={16} color="#f59e0b" />}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>

        <div style={{ display: "flex", flexDirection: "column", textAlign: "right", marginRight: "12px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-main)" }}>
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            {currentTime.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        <button className="btn-secondary" onClick={onRefresh} title="Sync database">
          <RefreshCw size={16} />
          <span>Sync</span>
        </button>

        <button className="btn-secondary" onClick={onQuickSale}>
          <span>⚡ New Sale</span>
        </button>

        <button className="btn-primary" onClick={onOpenAddMedicine}>
          <Plus size={18} />
          <span>Add Medicine</span>
        </button>
      </div>
    </header>
  );
}
