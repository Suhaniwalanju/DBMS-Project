import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  Receipt,
  Users,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Calendar
} from "lucide-react";
import StatCard from "../components/StatCard";
import { api } from "../services/api";

export default function Dashboard({ stats, onNavigate, onOpenInvoice, dataVersion }) {
  const [recentSales, setRecentSales] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardDetails();
  }, [dataVersion]);

  const loadDashboardDetails = async () => {
    setLoading(true);
    try {
      const [activity, lowStock, expiring] = await Promise.all([
        api.getRecentActivity(),
        api.getLowStockAlerts(),
        api.getExpiringAlerts(45),
      ]);
      setRecentSales(activity.recent_sales || []);

      // Combine and tag critical alerts
      const alerts = [
        ...lowStock.slice(0, 3).map((m) => ({ ...m, alertReason: "Low Stock Alert" })),
        ...expiring.slice(0, 3).map((m) => ({ ...m, alertReason: "Expiring Soon" })),
      ];
      setCriticalAlerts(alerts);
    } catch (err) {
      console.error("Failed to load dashboard details", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      {/* Top Metric Cards */}
      <div className="stats-grid">
        <StatCard
          title="Today's Revenue"
          value={`Rs. ${parseFloat(stats?.today_revenue || 0).toFixed(2)}`}
          icon={DollarSign}
          color="green"
          subtitle={`${stats?.today_sales_count || 0} transactions today`}
        />
        <StatCard
          title="Total Lifetime Sales"
          value={`Rs. ${parseFloat(stats?.total_revenue || 0).toFixed(2)}`}
          icon={TrendingUp}
          color="blue"
          subtitle={`${stats?.total_sales_count || 0} completed orders`}
        />
        <StatCard
          title="Medicines in Stock"
          value={stats?.total_medicines || 0}
          icon={Package}
          color="purple"
          subtitle={`${stats?.total_customers || 0} registered patients`}
        />
        <StatCard
          title="Stock & Expiry Alerts"
          value={(stats?.low_stock_count || 0) + (stats?.expiring_soon_count || 0) + (stats?.expired_count || 0)}
          icon={AlertTriangle}
          color={stats?.expired_count > 0 ? "rose" : "amber"}
          trend={{
            isNegative: true,
            text: `${stats?.low_stock_count || 0} low stock • ${stats?.expired_count || 0} expired`,
          }}
        />
      </div>

      {/* Main Grid: Urgent Alerts & Recent Sales */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
        {/* Critical Attention Panel */}
        <div className="surface-panel">
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldAlert size={20} color="#fb7185" />
              <h3 className="panel-title">Urgent Pharmacy Attention</h3>
            </div>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.78rem" }} onClick={() => onNavigate("alerts")}>
              View All Alerts <ArrowRight size={14} />
            </button>
          </div>

          {criticalAlerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8" }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: "0 auto 10px" }} />
              <p style={{ fontWeight: "600" }}>All stock levels healthy!</p>
              <p style={{ fontSize: "0.8rem", color: "#64748b" }}>No expired or critically low medicine batches.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {criticalAlerts.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "var(--bg-surface)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{item.name}</div>
                    <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                      Batch: {item.batch_number} • Exp: {item.expiry_date}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span className={`badge badge-${item.status}`} style={{ marginBottom: "4px" }}>
                      {item.alertReason}
                    </span>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Stock: <strong>{item.stock_quantity}</strong> (Min: {item.reorder_level})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="surface-panel">
          <div className="panel-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Receipt size={20} color="#38bdf8" />
              <h3 className="panel-title">Recent Invoices</h3>
            </div>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.78rem" }} onClick={() => onNavigate("sales")}>
              View All Sales <ArrowRight size={14} />
            </button>
          </div>

          {recentSales.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 0", color: "#94a3b8" }}>
              <p>No transactions recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentSales.map((sale) => (
                <div
                  key={sale.sale_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: "var(--bg-surface)",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "0.88rem" }}>{sale.customer_name}</div>
                    <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
                      Invoice #{sale.sale_id} • {new Date(sale.sale_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {sale.payment_method}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontWeight: "700", color: "#38bdf8", fontFamily: "var(--font-mono)" }}>
                      Rs. {sale.final_amount.toFixed(2)}
                    </span>
                    <button
                      className="btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                      onClick={() => onOpenInvoice(sale.sale_id)}
                    >
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
