import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import POSBilling from "./pages/POSBilling";
import Inventory from "./pages/Inventory";
import Alerts from "./pages/Alerts";
import SalesHistory from "./pages/SalesHistory";
import Suppliers from "./pages/Suppliers";
import AddMedicineModal from "./components/AddMedicineModal";
import InvoiceModal from "./components/InvoiceModal";
import { api } from "./services/api";

export default function App() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pharmacare-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pharmacare-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const [activeInvoice, setActiveInvoice] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [currentTab]);

  const fetchStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const handleOpenAddMedicine = () => {
    setEditingMedicine(null);
    setIsAddModalOpen(true);
  };

  const handleEditMedicine = (med) => {
    setEditingMedicine(med);
    setIsAddModalOpen(true);
  };

  const handleSaleCompleted = (completedSale) => {
    fetchStats();
    setActiveInvoice(completedSale);
  };

  const handleOpenInvoiceById = async (sale_id) => {
    try {
      const sale = await api.getSale(sale_id);
      setActiveInvoice(sale);
    } catch (err) {
      alert("Failed to load invoice receipt: " + err.message);
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        stats={stats}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          currentTab={currentTab}
          onOpenAddMedicine={handleOpenAddMedicine}
          onQuickSale={() => setCurrentTab("pos")}
          onRefresh={fetchStats}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main>
          {currentTab === "dashboard" && (
            <Dashboard
              stats={stats}
              onNavigate={setCurrentTab}
              onOpenInvoice={handleOpenInvoiceById}
            />
          )}

          {currentTab === "pos" && (
            <POSBilling
              onSaleCompleted={handleSaleCompleted}
            />
          )}

          {currentTab === "inventory" && (
            <Inventory
              onOpenAddModal={handleOpenAddMedicine}
              onEditMedicine={handleEditMedicine}
            />
          )}

          {currentTab === "alerts" && (
            <Alerts
              onEditMedicine={handleEditMedicine}
              onOpenAddModal={handleOpenAddMedicine}
            />
          )}

          {currentTab === "sales" && (
            <SalesHistory
              onOpenInvoice={handleOpenInvoiceById}
            />
          )}

          {currentTab === "suppliers" && (
            <Suppliers />
          )}
        </main>
      </div>

      {/* Add / Edit Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        initialData={editingMedicine}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={fetchStats}
      />

      {/* Invoice Receipt Modal */}
      <InvoiceModal
        sale={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />
    </div>
  );
}
