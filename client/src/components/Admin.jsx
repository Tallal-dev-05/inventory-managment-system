import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPKR } from "../utils/currency";
import { api } from "../utils/api";

function Admin() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);

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
          customersResponse,
        ] = await Promise.all([
          fetch(api("/api/products"), {
            credentials: "include",
          }),

          fetch(api("/api/purchases"), {
            credentials: "include",
          }),

          fetch(api("/api/sales"), {
            credentials: "include",
          }),

          fetch(api("/api/customers"), {
            credentials: "include",
          }),
        ]);

        const productsData = await productsResponse.json();
        const purchasesData = await purchasesResponse.json();
        const salesData = await salesResponse.json();
        const customersData = await customersResponse.json();

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

        if (!customersResponse.ok) {
          throw new Error(
            customersData.message || "Failed to load customers"
          );
        }

        setProducts(productsData.products || []);
        setPurchases(purchasesData.purchases || []);
        setSales(salesData.sales || []);
        setCustomers(customersData.customers || []);
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
      await fetch(api("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
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

  const totalOutstanding = customers.reduce(
    (total, customer) =>
      total + Number(customer.balance || 0),
    0
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0b0e13] text-[#e8eaf2] font-sans">
        <div className="w-9 h-9 rounded-full border-4 border-[#232839] border-t-[#6865f5] animate-spin mb-4"></div>

        <h2 className="text-base font-semibold">
          Loading dashboard...
        </h2>

        <p className="text-xs text-[#7c86a5] mt-1">
          Please wait
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-[190px_minmax(0,1fr)] bg-[#0b0e13] text-[#e8eaf2] font-sans overflow-x-hidden">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <aside className="lg:sticky lg:top-0 lg:h-screen flex flex-col p-2.5 border-b lg:border-b-0 lg:border-r border-[#232839] bg-[#0d1016]">

        {/* BRAND */}

        <div className="flex items-center gap-2 px-2 py-1 pb-4 lg:pb-5 text-white text-xs font-extrabold">
          <span className="w-7 h-7 grid place-items-center rounded-md bg-[#6865f5] text-white text-[11px] font-extrabold shrink-0">
            I
          </span>

          <span>INVENTORY</span>
        </div>

        {/* NAVIGATION */}

        <nav className="grid grid-cols-2 lg:flex lg:flex-col gap-1">

          <button
            type="button"
            className="relative w-full h-9 flex items-center justify-center lg:justify-start gap-2 px-2.5 rounded-md bg-[#202435] text-[#8986ff] text-[10px] lg:text-[11px]"
          >
            <span className="w-[18px] h-[18px] grid place-items-center text-xs">
              ▦
            </span>

            Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="w-full h-9 flex items-center justify-center lg:justify-start gap-2 px-2.5 rounded-md bg-transparent text-[#7c86a5] hover:text-[#c5c4ff] hover:bg-[#181c28] text-[10px] lg:text-[11px] transition"
          >
            <span className="w-[18px] h-[18px] grid place-items-center text-xs">
              □
            </span>

            Products
          </button>

          <button
            type="button"
            onClick={() => navigate("/purchases")}
            className="w-full h-9 flex items-center justify-center lg:justify-start gap-2 px-2.5 rounded-md bg-transparent text-[#7c86a5] hover:text-[#c5c4ff] hover:bg-[#181c28] text-[10px] lg:text-[11px] transition"
          >
            <span className="w-[18px] h-[18px] grid place-items-center text-xs">
              +
            </span>

            Purchases
          </button>

          <button
            type="button"
            onClick={() => navigate("/sales")}
            className="w-full h-9 flex items-center justify-center lg:justify-start gap-2 px-2.5 rounded-md bg-transparent text-[#7c86a5] hover:text-[#c5c4ff] hover:bg-[#181c28] text-[10px] lg:text-[11px] transition"
          >
            <span className="w-[18px] h-[18px] grid place-items-center text-xs">
              $
            </span>

            Sales
          </button>

        </nav>

        <div className="hidden lg:block mt-auto pt-3.5 px-2 border-t border-[#232839] text-[#59617a] text-[8px]">
          Inventory Management
        </div>
      </aside>


      {/* ==================================================
          MAIN DASHBOARD
      ================================================== */}

      <main className="min-w-0 min-h-screen px-3 sm:px-4 lg:px-[22px] pb-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="min-h-[66px] flex flex-col sm:grid sm:grid-cols-[1fr_auto] lg:flex lg:flex-row lg:items-center gap-2.5 lg:gap-[17px] -mx-3 sm:-mx-4 lg:-mx-[22px] mb-5 px-3 sm:px-4 lg:px-[22px] py-2.5 border-b border-[#232839] bg-[#0b0e13]/95">

          {/* BRAND */}

          <div className="flex items-center gap-2 min-w-0 lg:min-w-[185px]">

            <div className="w-[30px] h-[30px] grid place-items-center shrink-0 rounded-lg bg-[#6865f5] text-white text-[9px] font-extrabold">
              IM
            </div>

            <div>
              <h1 className="m-0 text-white text-[15px] font-bold leading-tight tracking-tight">
                Admin Dashboard
              </h1>

              <p className="m-0 mt-0.5 text-[#7c86a5] text-[9px]">
                Inventory Management System
              </p>
            </div>
          </div>


          {/* SEARCH */}

          <label className="w-full lg:w-[300px] h-[34px] flex items-center gap-2 px-2.5 rounded-lg border border-[#232839] bg-[#121620] text-[#7c86a5] focus-within:border-[#6865f5] transition sm:col-span-2 lg:col-span-1 lg:mr-auto">

            <span className="text-sm">
              ⌕
            </span>

            <input
              type="search"
              value={dashboardSearch}
              onChange={(event) =>
                setDashboardSearch(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  dashboardSearch.trim()
                ) {
                  navigate(
                    `/products?search=${encodeURIComponent(
                      dashboardSearch.trim()
                    )}`
                  );
                }
              }}
              placeholder="Search products and press Enter"
              aria-label="Search products"
              className="w-full h-full outline-none border-0 bg-transparent text-[#e8eaf2] text-[10px] placeholder:text-[#626b86]"
            />

          </label>


          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            className="absolute right-3 top-3 sm:static sm:justify-self-end lg:static h-8 px-3 rounded-md border border-[#2c3246] bg-[#1a1f2e] text-[#bbc2db] text-[9px] font-bold hover:bg-[#6865f5] hover:text-white transition"
          >
            LOG OUT
          </button>

        </header>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-4 p-2.5 flex flex-col gap-0.5 rounded-md border border-[#64323c] bg-[#28171d] text-[#ff8b96]">
            <strong className="text-[11px]">
              Something went wrong
            </strong>

            <span className="text-[9px]">
              {error}
            </span>
          </div>
        )}


        {/* ==================================================
            OVERVIEW
        ================================================== */}

        <section className="mb-4">

          <div className="mb-2.5">
            <h2 className="m-0 text-[#f0f1f6] text-[13px] font-bold">
              Overview
            </h2>

            <p className="m-0 mt-1 text-[#7c86a5] text-[9px]">
              Your inventory performance at a glance
            </p>
          </div>


          {/* STATS */}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">


            {/* PRODUCTS */}

            <div className="relative min-w-0 min-h-[112px] overflow-hidden p-3 rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-7 h-7 grid place-items-center rounded-md bg-[#202441] text-xs">
                  📦
                </div>

                <span className="text-[#7c86a5] text-[7px] font-extrabold tracking-wider">
                  PRODUCTS
                </span>
              </div>

              <div className="text-[#f1f2f6] text-xl font-extrabold leading-none">
                {totalProducts}
              </div>

              <div className="mt-1.5 text-[#7c86a5] text-[8px]">
                Total products
              </div>

            </div>


            {/* STOCK */}

            <div className="relative min-w-0 min-h-[112px] overflow-hidden p-3 rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-7 h-7 grid place-items-center rounded-md bg-[#12352e] text-xs">
                  📊
                </div>

                <span className="text-[#7c86a5] text-[7px] font-extrabold tracking-wider">
                  STOCK
                </span>
              </div>

              <div className="text-[#f1f2f6] text-xl font-extrabold leading-none">
                {totalStock}
              </div>

              <div className="mt-1.5 text-[#7c86a5] text-[8px]">
                Units currently available
              </div>

            </div>


            {/* LOW STOCK */}

            <div className="relative min-w-0 min-h-[112px] overflow-hidden p-3 rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-7 h-7 grid place-items-center rounded-md bg-[#332a15] text-xs">
                  ⚠️
                </div>

                <span className="text-[#7c86a5] text-[7px] font-extrabold tracking-wider">
                  LOW STOCK
                </span>
              </div>

              <div className="text-[#f1f2f6] text-xl font-extrabold leading-none">
                {lowStockProducts.length}
              </div>

              <div className="mt-1.5 text-[#7c86a5] text-[8px]">
                Products need attention
              </div>

            </div>


            {/* PURCHASES */}

            <div className="relative min-w-0 min-h-[112px] overflow-hidden p-3 rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-7 h-7 grid place-items-center rounded-md bg-[#172b40] text-xs">
                  🛒
                </div>

                <span className="text-[#7c86a5] text-[7px] font-extrabold tracking-wider">
                  PURCHASES
                </span>
              </div>

              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[#f1f2f6] text-sm font-extrabold">
                {formatPKR(totalPurchaseAmount)}
              </div>

              <div className="mt-1.5 text-[#7c86a5] text-[8px]">
                Total purchase value
              </div>

            </div>


            {/* SALES */}

            <div className="relative min-w-0 min-h-[112px] overflow-hidden p-3 rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-7 h-7 grid place-items-center rounded-md bg-[#123632] text-xs">
                  💰
                </div>

                <span className="text-[#7c86a5] text-[7px] font-extrabold tracking-wider">
                  SALES
                </span>
              </div>

              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[#f1f2f6] text-sm font-extrabold">
                {formatPKR(totalSalesAmount)}
              </div>

              <div className="mt-1.5 text-[#7c86a5] text-[8px]">
                Total sales revenue
              </div>

            </div>


            {/* PROFIT */}

            <div className="relative min-w-0 min-h-[112px] overflow-hidden p-3 rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-7 h-7 grid place-items-center rounded-md bg-[#28203d] text-xs">
                  📈
                </div>

                <span className="text-[#7c86a5] text-[7px] font-extrabold tracking-wider">
                  PROFIT
                </span>
              </div>

              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[#f1f2f6] text-sm font-extrabold">
                {formatPKR(totalProfit)}
              </div>

              <div className="mt-1.5 text-[#7c86a5] text-[8px]">
                Total profit earned
              </div>

            </div>


            {/* OUTSTANDING */}

            <div className="relative min-w-0 min-h-[112px] overflow-hidden p-3 rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">

              <div className="flex items-center justify-between mb-2.5">
                <div className="w-7 h-7 grid place-items-center rounded-md bg-[#392618] text-[#efa246] text-xs">
                  ₨
                </div>

                <span className="text-[#7c86a5] text-[7px] font-extrabold tracking-wider">
                  OUTSTANDING
                </span>
              </div>

              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[#f1f2f6] text-sm font-extrabold">
                {formatPKR(totalOutstanding)}
              </div>

              <div className="mt-1.5 text-[#7c86a5] text-[8px]">
                Customer credit due
              </div>

            </div>

          </div>
        </section>


        {/* ==================================================
            LOW STOCK + QUICK ACTIONS
        ================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-2.5 mb-2.5">


          {/* LOW STOCK */}

          <section className="min-w-0 p-3.5 rounded-[10px] border border-[#232839] bg-[#121620]">

            <div className="flex items-center justify-between gap-2.5 mb-3">

              <div>
                <h2 className="m-0 text-[#f0f1f6] text-[13px] font-bold">
                  Low Stock Products
                </h2>

                <p className="m-0 mt-1 text-[#7c86a5] text-[9px]">
                  Products that need your attention
                </p>
              </div>

              <span className="min-w-[23px] h-[23px] px-1.5 grid place-items-center rounded-md bg-[#352815] text-[#f5b719] text-[9px] font-extrabold">
                {lowStockProducts.length}
              </span>

            </div>


            {lowStockProducts.length === 0 ? (

              <div className="py-5 px-2.5 text-center">

                <div className="w-8 h-8 mx-auto mb-2 grid place-items-center rounded-full bg-[#12352e] text-[#00c995] text-xs">
                  ✓
                </div>

                <h3 className="m-0 text-[#dfe2ec] text-[10px]">
                  Stock levels look good
                </h3>

                <p className="max-w-[290px] mx-auto mt-1 text-[#7c86a5] text-[8px] leading-relaxed">
                  No products are currently below
                  their minimum stock level.
                </p>

              </div>

            ) : (

              <div className="flex flex-col gap-1.5 max-h-[225px] overflow-y-auto pr-1">

                {lowStockProducts.map((product) => (

                  <div
                    key={product._id}
                    className="flex items-center justify-between gap-2.5 p-2.5 rounded-md border border-[#202637] bg-[#10141d] hover:bg-[#171b27] transition"
                  >

                    <div className="min-w-0 flex flex-col gap-0.5">

                      <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[#dfe2ec] text-[10px]">
                        {product.name}
                      </strong>

                      <span className="text-[#7c86a5] text-[8px]">
                        SKU: {product.sku}
                      </span>

                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-0.5">

                      <span className="text-[#f46b78] text-[9px] font-bold">
                        {product.quantity} left
                      </span>

                      <small className="text-[#7c86a5] text-[7px]">
                        Min: {product.minimumStock}
                      </small>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>


          {/* QUICK ACTIONS */}

          <section className="min-w-0 p-3.5 rounded-[10px] border border-[#232839] bg-[#121620]">

            <div className="mb-3">

              <h2 className="m-0 text-[#f0f1f6] text-[13px] font-bold">
                Quick Actions
              </h2>

              <p className="m-0 mt-1 text-[#7c86a5] text-[9px]">
                Manage your inventory
              </p>

            </div>


            <div className="flex flex-col gap-1.5">

              {/* MANAGE PRODUCTS */}

              <button
                onClick={() => navigate("/products")}
                className="w-full min-h-12 flex items-center gap-2 p-2 rounded-md border border-[#202637] bg-[#10141d] text-left hover:border-[#46439f] hover:bg-[#171b27] transition"
              >

                <span className="w-7 h-7 shrink-0 grid place-items-center rounded-md bg-[#202441] text-[11px]">
                  📦
                </span>

                <div className="min-w-0 flex flex-col gap-0.5">

                  <strong className="text-[#dfe2ec] text-[9px]">
                    Manage Products
                  </strong>

                  <small className="text-[#7c86a5] text-[7px]">
                    Add, edit or remove products
                  </small>

                </div>

                <span className="ml-auto text-[#707a99] text-sm">
                  →
                </span>

              </button>


              {/* RECORD PURCHASE */}

              <button
                onClick={() => navigate("/purchases")}
                className="w-full min-h-12 flex items-center gap-2 p-2 rounded-md border border-[#202637] bg-[#10141d] text-left hover:border-[#46439f] hover:bg-[#171b27] transition"
              >

                <span className="w-7 h-7 shrink-0 grid place-items-center rounded-md bg-[#202441] text-[11px]">
                  🛒
                </span>

                <div className="min-w-0 flex flex-col gap-0.5">

                  <strong className="text-[#dfe2ec] text-[9px]">
                    Record Purchase
                  </strong>

                  <small className="text-[#7c86a5] text-[7px]">
                    Add stock from suppliers
                  </small>

                </div>

                <span className="ml-auto text-[#707a99] text-sm">
                  →
                </span>

              </button>


              {/* RECORD SALE */}

              <button
                onClick={() => navigate("/sales")}
                className="w-full min-h-12 flex items-center gap-2 p-2 rounded-md border border-[#202637] bg-[#10141d] text-left hover:border-[#46439f] hover:bg-[#171b27] transition"
              >

                <span className="w-7 h-7 shrink-0 grid place-items-center rounded-md bg-[#202441] text-[11px]">
                  💰
                </span>

                <div className="min-w-0 flex flex-col gap-0.5">

                  <strong className="text-[#dfe2ec] text-[9px]">
                    Record Sale
                  </strong>

                  <small className="text-[#7c86a5] text-[7px]">
                    Record a customer sale
                  </small>

                </div>

                <span className="ml-auto text-[#707a99] text-sm">
                  →
                </span>

              </button>

            </div>

          </section>

        </div>


        {/* ==================================================
            RECENT SALES
        ================================================== */}

        <section className="w-full min-w-0 mb-4 p-3.5 overflow-hidden rounded-[10px] border border-[#232839] bg-[#121620]">

          <div className="flex items-start justify-between gap-4 mb-3">

            <div>
              <h2 className="m-0 text-[#f0f1f6] text-[13px] font-bold">
                Recent Sales
              </h2>

              <p className="m-0 mt-1 text-[#7782a4] text-[9px]">
                Your latest transactions
              </p>
            </div>

            <button
              onClick={() => navigate("/sales")}
              className="shrink-0 px-2 py-1 rounded-md bg-transparent text-[#8582ff] text-[8px] font-bold hover:bg-[#202441] transition"
            >
              View All →
            </button>

          </div>


          {sales.length === 0 ? (

            <div className="min-h-[120px] flex flex-col items-center justify-center py-5 px-3 text-center">

              <div className="w-8 h-8 mb-2 grid place-items-center rounded-full bg-[#12352e] text-[#00c995] text-xs">
                💰
              </div>

              <h3 className="m-0 text-[#dfe2ec] text-[10px]">
                No sales yet
              </h3>

              <p className="max-w-[290px] mx-auto mt-1 text-[#7c86a5] text-[8px]">
                Your recent sales will appear here.
              </p>

            </div>

          ) : (

            <div className="w-full overflow-x-auto overflow-y-hidden rounded-lg border border-[#202637] bg-[#10131a]">

              <table className="w-full min-w-[720px] border-collapse border-spacing-0 table-fixed">

                <thead>

                  <tr>
                    <th className="w-[27%] h-[35px] px-2.5 border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-[7px] font-extrabold tracking-wider text-left">
                      PRODUCT
                    </th>

                    <th className="w-[19%] h-[35px] px-2.5 border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-[7px] font-extrabold tracking-wider text-left">
                      CUSTOMER
                    </th>

                    <th className="w-[9%] h-[35px] px-2.5 border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-[7px] font-extrabold tracking-wider text-center">
                      QTY
                    </th>

                    <th className="w-[16%] h-[35px] px-2.5 border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-[7px] font-extrabold tracking-wider text-left">
                      TOTAL
                    </th>

                    <th className="w-[14%] h-[35px] px-2.5 border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-[7px] font-extrabold tracking-wider text-left">
                      PROFIT
                    </th>

                    <th className="w-[15%] h-[35px] px-2.5 border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-[7px] font-extrabold tracking-wider text-left">
                      DATE
                    </th>
                  </tr>

                </thead>


                <tbody>

                  {sales.slice(0, 5).map((sale) => (

                    <tr
                      key={sale._id}
                      className="hover:bg-[#171b27] transition"
                    >

                      {/* PRODUCT */}

                      <td className="h-12 px-2.5 border-b border-[#202637] text-[#aeb5ca] text-[9px]">

                        <div className="flex items-center gap-2">

                          <div className="w-[27px] h-[27px] shrink-0 grid place-items-center rounded-md bg-[#202441] text-[10px]">
                            📦
                          </div>

                          <div className="min-w-0 flex flex-col gap-px">

                            <strong className="block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-[#dfe2ec] text-[9px]">
                              {sale.product?.name ||
                                "Unknown Product"}
                            </strong>

                            <span className="block max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-[#69738f] text-[7px]">
                              {sale.product?.sku || "-"}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* CUSTOMER */}

                      <td className="h-12 px-2.5 border-b border-[#202637] text-[#aeb5ca] text-[9px] whitespace-nowrap">
                        {sale.customerName ||
                          "Walk-in Customer"}
                      </td>


                      {/* QTY */}

                      <td className="h-12 px-2.5 border-b border-[#202637] text-[#aeb5ca] text-[9px] text-center">
                        {sale.quantity}
                      </td>


                      {/* TOTAL */}

                      <td className="h-12 px-2.5 border-b border-[#202637] text-[#e0e3ed] text-[9px] font-semibold whitespace-nowrap">
                        {formatPKR(sale.totalAmount)}
                      </td>


                      {/* PROFIT */}

                      <td className="h-12 px-2.5 border-b border-[#202637] text-[#00c995] text-[9px] font-bold whitespace-nowrap">
                        {formatPKR(sale.profit)}
                      </td>


                      {/* DATE */}

                      <td className="h-12 px-2.5 border-b border-[#202637] text-[#aeb5ca] text-[9px] whitespace-nowrap">
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


        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="w-full py-2 text-[#59617a] text-center text-[8px] leading-relaxed">
          Inventory Management System
        </footer>

      </main>
    </div>
  );
}

export default Admin;