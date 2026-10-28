import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  AlertTriangle,
  History,
  Building2,
  Activity,
  HeartPulse
} from "lucide-react";

export default function Sidebar({ currentTab, setCurrentTab, stats }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pos", label: "POS Billing", icon: ShoppingCart },
    { id: "inventory", label: "Medicines & Stock", icon: Pill, count: stats?.total_medicines },
    {
      id: "alerts",
      label: "Alerts & Expiry",
      icon: AlertTriangle,
      alertCount: (stats?.low_stock_count || 0) + (stats?.expiring_soon_count || 0) + (stats?.expired_count || 0),
      alertType: stats?.expired_count > 0 ? "danger" : "warning",
    },
    { id: "sales", label: "Sales & Invoices", icon: History },
    { id: "suppliers", label: "Suppliers & Catalog", icon: Building2 },
  ];

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand-section">
        <div className="brand-logo-badge">
          <HeartPulse size={26} strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="brand-title">PharmaCare</h1>
          <p className="brand-subtitle">Smart DBMS</p>
        </div>
      </div>

      {/* Navigation */}
      <ul className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <li key={item.id}>
              <button
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => setCurrentTab(item.id)}
                style={{ width: "100%", textAlign: "left", background: "none", border: "none" }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.alertCount > 0 && (
                  <span className={`nav-badge ${item.alertType}`}>
                    {item.alertCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="system-status-indicator">
          <span className="pulse-dot"></span>
          <span>PostgreSQL Active (Port 5432)</span>
        </div>
      </div>
    </aside>
  );
}
