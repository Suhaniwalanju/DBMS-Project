import React from "react";

export default function StatCard({ title, value, icon: Icon, color = "blue", subtitle, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-title">{title}</span>
        <div className={`stat-icon-wrapper ${color}`}>
          <Icon size={22} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {(subtitle || trend) && (
        <div className="stat-trend" style={{ color: trend?.isNegative ? "#fb7185" : "#94a3b8" }}>
          {trend?.text || subtitle}
        </div>
      )}
    </div>
  );
}
