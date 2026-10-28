const BASE_URL = "http://127.0.0.1:8000/api";

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${options.method || "GET"} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getStats: () => request("/dashboard/stats"),
  getRecentActivity: () => request("/dashboard/recent-activity"),

  // Medicines
  getMedicines: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append("search", params.search);
    if (params.category_id) q.append("category_id", params.category_id);
    if (params.status_filter) q.append("status_filter", params.status_filter);
    const queryString = q.toString() ? `?${q.toString()}` : "";
    return request(`/medicines${queryString}`);
  },
  getMedicine: (id) => request(`/medicines/${id}`),
  createMedicine: (data) => request("/medicines", { method: "POST", body: JSON.stringify(data) }),
  updateMedicine: (id, data) => request(`/medicines/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMedicine: (id) => request(`/medicines/${id}`, { method: "DELETE" }),
  getLowStockAlerts: () => request("/medicines/alerts/low-stock"),
  getExpiringAlerts: (days = 60) => request(`/medicines/alerts/expiring-soon?days=${days}`),
  getAlternatives: (id) => request(`/medicines/${id}/alternatives`),

  // Sales & POS
  getSales: (limit = 50) => request(`/sales?limit=${limit}`),
  getSale: (id) => request(`/sales/${id}`),
  createSale: (saleData) => request("/sales", { method: "POST", body: JSON.stringify(saleData) }),

  // Customers
  getCustomers: (search = "") => request(search ? `/customers?search=${encodeURIComponent(search)}` : "/customers"),
  createCustomer: (data) => request("/customers", { method: "POST", body: JSON.stringify(data) }),

  // Suppliers & Categories
  getSuppliers: () => request("/suppliers"),
  createSupplier: (data) => request("/suppliers", { method: "POST", body: JSON.stringify(data) }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: "DELETE" }),

  getCategories: () => request("/categories"),
  createCategory: (data) => request("/categories", { method: "POST", body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE" }),
};
