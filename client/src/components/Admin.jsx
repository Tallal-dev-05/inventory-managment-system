import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
import { formatPKR } from "../utils/currency";

function Admin() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardSearch, setDashboardSearch] = useState("");

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          purchasesResponse,
          salesResponse,
        ] = await Promise.all([
          fetch("http://localhost:5000/api/products", {
            credentials: "include",
          }),

          fetch("http://localhost:5000/api/purchases", {
            credentials: "include",
          }),

          fetch("http://localhost:5000/api/sales", {
            credentials: "include",
          }),
        ]);

        const productsData = await productsResponse.json();
        const purchasesData = await purchasesResponse.json();
        const salesData = await salesResponse.json();

        if (!productsResponse.ok) {
          throw new Error(
            productsData.message || "Failed to load products"
          );
        }

        if (!purchasesResponse.ok) {
          throw new Error(
            purchasesData.message || "Failed to load purchases"
          );
        }

        if (!salesResponse.ok) {
          throw new Error(
            salesData.message || "Failed to load sales"
          );
        }

        setProducts(productsData.products || []);
        setPurchases(purchasesData.purchases || []);
        setSales(salesData.sales || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      await fetch(
        "http://localhost:5000/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );
    } finally {
      navigate("/signin", { replace: true });
    }
  };

  // ==========================================
  // DASHBOARD CALCULATIONS
  // ==========================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.quantity || 0) <=
      Number(product.minimumStock || 0)
  );

  const totalPurchaseAmount = purchases.reduce(
    (total, purchase) =>
      total + Number(purchase.totalAmount || 0),
    0
  );

  const totalSalesAmount = sales.reduce(
    (total, sale) =>
      total + Number(sale.totalAmount || 0),
    0
  );

  const totalProfit = sales.reduce(
    (total, sale) =>
      total + Number(sale.profit || 0),
    0
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <h2>Loading dashboard...</h2>
        <p>Please wait</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">I</span>
          <span>INVENTORY</span>
        </div>

        <nav className="sidebar-navigation" aria-label="Admin navigation">
          <button className="sidebar-link active" type="button">
            <span className="sidebar-icon">▦</span>
            Dashboard
          </button>
          <button className="sidebar-link" type="button" onClick={() => navigate("/products")}>
            <span className="sidebar-icon">□</span>
            Products
          </button>
          <button className="sidebar-link" type="button" onClick={() => navigate("/purchases")}>
            <span className="sidebar-icon">+</span>
            Purchases
          </button>
          <button className="sidebar-link" type="button" onClick={() => navigate("/sales")}>
            <span className="sidebar-icon">$</span>
            Sales
          </button>
        </nav>

        <div className="sidebar-footer">Inventory Management</div>
      </aside>

      <main className="admin-dashboard">

      {/* HEADER */}

      <header className="admin-header">

        <div className="admin-brand">
          <div className="admin-logo">
            IM
          </div>

          <div>
            <h1>Admin Dashboard</h1>
            <p>Inventory Management System</p>
          </div>
        </div>

        <label className="dashboard-search">
          <span>⌕</span>
          <input
            type="search"
            value={dashboardSearch}
            onChange={(event) => setDashboardSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && dashboardSearch.trim()) {
                navigate(`/products?search=${encodeURIComponent(dashboardSearch.trim())}`);
              }
            }}
            placeholder="Search products and press Enter"
            aria-label="Search products"
          />
        </label>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          LOG OUT
        </button>

      </header>


      {/* ERROR */}

      {error && (
        <div className="error-box">
          <strong>Something went wrong</strong>
          <span>{error}</span>
        </div>
      )}


      {/* NAVIGATION */}

      <nav className="admin-navigation">

        <button
          onClick={() => navigate("/products")}
        >
          <span>📦</span>
          PRODUCTS
        </button>

        <button
          onClick={() => navigate("/purchases")}
        >
          <span>🛒</span>
          PURCHASES
        </button>

        <button
          onClick={() => navigate("/sales")}
        >
          <span>💰</span>
          SALES
        </button>

      </nav>


      {/* OVERVIEW */}

      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Overview</h2>
            <p>Your inventory performance at a glance</p>
          </div>
        </div>


        <div className="dashboard-stats">

          {/* PRODUCTS */}

          <div className="stat-card stat-products">

            <div className="stat-top">
              <div className="stat-icon">
                📦
              </div>

              <span className="stat-label">
                PRODUCTS
              </span>
            </div>

            <div className="stat-value">
              {totalProducts}
            </div>

            <div className="stat-description">
              Total products
            </div>

          </div>


          {/* STOCK */}

          <div className="stat-card stat-stock">

            <div className="stat-top">
              <div className="stat-icon">
                📊
              </div>

              <span className="stat-label">
                STOCK
              </span>
            </div>

            <div className="stat-value">
              {totalStock}
            </div>

            <div className="stat-description">
              Units currently available
            </div>

          </div>


          {/* LOW STOCK */}

          <div className="stat-card stat-low-stock">

            <div className="stat-top">
              <div className="stat-icon">
                ⚠️
              </div>

              <span className="stat-label">
                LOW STOCK
              </span>
            </div>

            <div className="stat-value">
              {lowStockProducts.length}
            </div>

            <div className="stat-description">
              Products need attention
            </div>

          </div>


          {/* PURCHASES */}

          <div className="stat-card stat-purchases">

            <div className="stat-top">
              <div className="stat-icon">
                🛒
              </div>

              <span className="stat-label">
                PURCHASES
              </span>
            </div>

            <div className="stat-value money">
              {formatPKR(totalPurchaseAmount)}
            </div>

            <div className="stat-description">
              Total purchase value
            </div>

          </div>


          {/* SALES */}

          <div className="stat-card stat-sales">

            <div className="stat-top">
              <div className="stat-icon">
                💰
              </div>

              <span className="stat-label">
                SALES
              </span>
            </div>

            <div className="stat-value money">
              {formatPKR(totalSalesAmount)}
            </div>

            <div className="stat-description">
              Total sales revenue
            </div>

          </div>


          {/* PROFIT */}

          <div className="stat-card stat-profit">

            <div className="stat-top">
              <div className="stat-icon">
                📈
              </div>

              <span className="stat-label">
                PROFIT
              </span>
            </div>

            <div className="stat-value money">
              {formatPKR(totalProfit)}
            </div>

            <div className="stat-description">
              Total profit earned
            </div>

          </div>

        </div>

      </section>


      {/* LOW STOCK + QUICK ACTIONS */}

      <div className="dashboard-grid">

        {/* LOW STOCK */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Low Stock Products</h2>
              <p>Products that need your attention</p>
            </div>

            <span className="card-count">
              {lowStockProducts.length}
            </span>

          </div>


          {lowStockProducts.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>Stock levels look good</h3>

              <p>
                No products are currently below
                their minimum stock level.
              </p>

            </div>

          ) : (

            <div className="low-stock-list">

              {lowStockProducts.map((product) => (

                <div
                  className="low-stock-item"
                  key={product._id}
                >

                  <div className="product-info">

                    <strong>
                      {product.name}
                    </strong>

                    <span>
                      SKU: {product.sku}
                    </span>

                  </div>

                  <div className="stock-info">

                    <span>
                      {product.quantity} left
                    </span>

                    <small>
                      Min: {product.minimumStock}
                    </small>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* QUICK ACTIONS */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Quick Actions</h2>
              <p>Manage your inventory</p>
            </div>

          </div>


          <div className="quick-actions">

            <button
              onClick={() => navigate("/products")}
            >
              <span className="action-icon">
                📦
              </span>

              <div>
                <strong>Manage Products</strong>
                <small>
                  Add, edit or remove products
                </small>
              </div>

              <span className="arrow">
                →
              </span>
            </button>


            <button
              onClick={() => navigate("/purchases")}
            >
              <span className="action-icon">
                🛒
              </span>

              <div>
                <strong>Record Purchase</strong>
                <small>
                  Add stock from suppliers
                </small>
              </div>

              <span className="arrow">
                →
              </span>
            </button>


            <button
              onClick={() => navigate("/sales")}
            >
              <span className="action-icon">
                💰
              </span>

              <div>
                <strong>Record Sale</strong>
                <small>
                  Record a customer sale
                </small>
              </div>

              <span className="arrow">
                →
              </span>
            </button>

          </div>

        </section>

      </div>


      {/* RECENT SALES */}

      <section className="dashboard-card sales-card">

        <div className="card-header">

          <div>
            <h2>Recent Sales</h2>
            <p>Your latest transactions</p>
          </div>

          <button
            className="view-all-button"
            onClick={() => navigate("/sales")}
          >
            View All →
          </button>

        </div>


        {sales.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              💰
            </div>

            <h3>No sales yet</h3>

            <p>
              Your recent sales will appear here.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="dashboard-table">

              <thead>

                <tr>
                  <th>PRODUCT</th>
                  <th>CUSTOMER</th>
                  <th>QTY</th>
                  <th>TOTAL</th>
                  <th>PROFIT</th>
                  <th>DATE</th>
                </tr>

              </thead>


              <tbody>

                {sales.slice(0, 5).map((sale) => (

                  <tr key={sale._id}>

                    <td>

                      <div className="table-product">

                        <div className="table-product-icon">
                          📦
                        </div>

                        <div>
                          <strong>
                            {sale.product?.name ||
                              "Unknown Product"}
                          </strong>

                          <span>
                            {sale.product?.sku ||
                              "-"}
                          </span>
                        </div>

                      </div>

                    </td>


                    <td>
                      {sale.customerName ||
                        "Walk-in Customer"}
                    </td>


                    <td>
                      {sale.quantity}
                    </td>


                    <td className="amount">
                      {formatPKR(sale.totalAmount)}
                    </td>


                    <td className="profit-value">
                      {formatPKR(sale.profit)}
                    </td>


                    <td>
                      {sale.saleDate
                        ? new Date(
                            sale.saleDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* FOOTER */}

      <footer className="admin-footer">
        Inventory Management System
      </footer>

      </main>
    </div>
  );
}

export default Admin;
