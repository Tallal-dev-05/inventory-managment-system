import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "../utils/useDebouncedValue";

const blank = {
  name: "",
  sku: "",
  category: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  quantity: "",
  minimumStock: "",
};

const categories = [
  "Electronics",
  "Clothing",
  "Grocery",
  "Furniture",
  "Stationery",
  "Hardware",
  "Other",
];

const Field = ({ label, wide, children }) => (
  <div
    className={`min-w-0 flex flex-col gap-1.5 ${
      wide ? "col-span-full" : ""
    }`}
  >
    <label className="text-[9px] font-bold text-[#aeb5ca]">{label}</label>
    {children}
  </div>
);

const inputClass =
  "w-full min-w-0 h-[34px] px-2.5 rounded-[7px] border border-[#232839] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] transition focus:border-[#6865f5] focus:ring-[3px] focus:ring-[#6865f5]/15 placeholder:text-[#5f6882]";

const textareaClass =
  "w-full min-w-0 min-h-[65px] px-2.5 py-2 rounded-[7px] border border-[#232839] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] leading-[1.5] resize-y transition focus:border-[#6865f5] focus:ring-[3px] focus:ring-[#6865f5]/15 placeholder:text-[#5f6882]";

const selectClass =
  "w-full min-w-0 h-[34px] px-2.5 rounded-[7px] border border-[#232839] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] cursor-pointer transition focus:border-[#6865f5] focus:ring-[3px] focus:ring-[#6865f5]/15";

const primaryButton =
  "min-h-[34px] px-[13px] rounded-[7px] border border-[#6865f5] bg-[#6865f5] text-white text-[9px] font-bold cursor-pointer transition hover:bg-[#7773ff] hover:border-[#7773ff] hover:-translate-y-px disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none";

const secondaryButton =
  "min-h-[34px] px-[13px] rounded-[7px] border border-[#2c3246] bg-[#1a1f2e] text-[#bbc2db] text-[9px] font-bold cursor-pointer transition hover:border-[#3a425a] hover:bg-[#22283a] disabled:opacity-55 disabled:cursor-not-allowed";

export default function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(blank);

  const [search, setSearch] = useState(
    () => searchParams.get("search") || ""
  );
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);

  const getProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(api("/api/products"), {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get products");
      }

      setProducts(data.products || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const requestId = window.setTimeout(() => {
      getProducts();
    }, 0);

    return () => window.clearTimeout(requestId);
  }, []);

  const close = () => {
    setShowForm(false);
    setEditing(null);
    setForm(blank);
    setFormError("");
  };

  const change = ({ target: { name, value } }) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openEdit = (product) => {
    setEditing(product);

    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      description: product.description || "",
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      minimumStock: product.minimumStock,
    });

    setFormError("");
    setShowForm(true);
  };

  async function save(event) {
    event.preventDefault();
    setFormError("");

    const needed = [
      "name",
      "sku",
      "category",
      "costPrice",
      "sellingPrice",
      "quantity",
      "minimumStock",
    ];

    if (needed.some((key) => !String(form[key]).trim())) {
      return setFormError("Please fill in all required fields.");
    }

    if (
      ["costPrice", "sellingPrice", "quantity", "minimumStock"].some(
        (key) => Number(form[key]) < 0
      )
    ) {
      return setFormError(
        "Prices and stock values cannot be negative."
      );
    }

    try {
      setSaving(true);

      const response = await fetch(
        editing
          ? api(`/api/products/${editing._id}`)
          : api("/api/products"),
        {
          method: editing ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            sku: form.sku.trim(),
            description: form.description.trim(),
            costPrice: Number(form.costPrice),
            sellingPrice: Number(form.sellingPrice),
            quantity: Number(form.quantity),
            minimumStock: Number(form.minimumStock),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save product"
        );
      }

      close();
      await getProducts();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this product?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        api(`/api/products/${id}`),
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete product"
        );
      }

      await getProducts();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = products.filter((p) => {
    const q = Number(p.quantity || 0);
    const min = Number(p.minimumStock || 0);

    const text = [p.name, p.sku].some((v) =>
      (v || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
    );

    const inventory =
      stock === "in"
        ? q > min
        : stock === "low"
        ? q > 0 && q <= min
        : stock === "out"
        ? q === 0
        : true;

    return (
      text &&
      (!category || p.category === category) &&
      inventory
    );
  });

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-[#0b0e13] text-[#e8eaf2] flex flex-col items-center justify-center gap-3 text-[10px] font-semibold">
        <div className="w-[31px] h-[31px] rounded-full border-[3px] border-[#232839] border-t-[#6865f5] animate-spin" />
        Loading products...
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full min-w-0 m-0 px-[26px] py-[22px] pb-[30px] bg-[#0b0e13] text-[#e8eaf2] font-sans text-[11px] overflow-x-hidden">

      {/* HEADER */}
      <header className="min-h-[64px] flex items-start justify-between gap-[18px] mb-5 pb-[17px] border-b border-[#232839]">

        <div>
          <button
            onClick={() => navigate("/Admin")}
            className="p-0 border-0 bg-transparent text-[#8582ff] text-[9px] font-bold cursor-pointer hover:text-[#aaa8ff]"
          >
            ← <span className="ml-1">Back to dashboard</span>
          </button>

          <h1 className="mt-[7px] mb-[3px] text-[20px] leading-[1.2] tracking-[-0.5px] text-[#f2f3f7]">
            Products
          </h1>

          <p className="m-0 text-[10px] leading-[1.5] text-[#7c86a5]">
            Manage your product catalog and stock levels
          </p>
        </div>

        {!showForm && (
          <button
            className={primaryButton}
            onClick={() => {
              setForm(blank);
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Add product
          </button>
        )}
      </header>

      {/* ERROR */}
      {error && (
        <div className="mb-[15px] p-[10px_12px] border border-[#64323c] rounded-[7px] bg-[#28171d] text-[#ff8b96] text-[9px] leading-[1.5]">
          {error}
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <section className="mb-[18px] p-[17px] border border-[#232839] rounded-[10px] bg-[#121620]">

          <div className="flex items-start justify-between gap-4 mb-[15px] pb-3 border-b border-[#232839]">

            <div>
              <h2 className="m-0 mb-[3px] text-[14px] leading-[1.3] text-[#f0f1f6]">
                {editing ? "Edit product" : "Add product"}
              </h2>

              <p className="m-0 text-[9px] text-[#7c86a5]">
                Enter the details needed to track this item.
              </p>
            </div>

            <button
              className="w-[27px] h-[27px] shrink-0 grid place-items-center p-0 border border-[#2b3144] rounded-[7px] bg-[#1a1f2e] text-[#9aa3bf] text-[18px] leading-none cursor-pointer hover:border-[#63343c] hover:bg-[#2a181e] hover:text-[#f46b78]"
              onClick={close}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {formError && (
            <div className="mb-[15px] p-[10px_12px] border border-[#64323c] rounded-[7px] bg-[#28171d] text-[#ff8b96] text-[9px] leading-[1.5]">
              {formError}
            </div>
          )}

          <form onSubmit={save}>

            <div className="grid grid-cols-4 gap-[13px] max-[1200px]:grid-cols-3 max-[900px]:grid-cols-2 max-[650px]:grid-cols-1">

              <Field label="Product name *">
                <input
                  className={inputClass}
                  name="name"
                  value={form.name}
                  onChange={change}
                  placeholder="e.g. Wireless mouse"
                />
              </Field>

              <Field label="SKU *">
                <input
                  className={inputClass}
                  name="sku"
                  value={form.sku}
                  onChange={change}
                  placeholder="e.g. WM-001"
                />
              </Field>

              <Field label="Category *">
                <select
                  className={selectClass}
                  name="category"
                  value={form.category}
                  onChange={change}
                >
                  <option value="">
                    Select a category
                  </option>

                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Description" wide>
                <textarea
                  className={textareaClass}
                  name="description"
                  value={form.description}
                  onChange={change}
                  rows="3"
                  placeholder="Optional product description"
                />
              </Field>

              <Field label="Cost price *">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  name="costPrice"
                  value={form.costPrice}
                  onChange={change}
                />
              </Field>

              <Field label="Selling price *">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={change}
                />
              </Field>

              <Field label="Opening quantity *">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  name="quantity"
                  value={form.quantity}
                  onChange={change}
                />
              </Field>

              <Field label="Low-stock threshold *">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  name="minimumStock"
                  value={form.minimumStock}
                  onChange={change}
                />
              </Field>

            </div>

            <div className="flex justify-end gap-2 mt-4 pt-[13px] border-t border-[#232839] max-[650px]:grid max-[650px]:grid-cols-2 max-[420px]:grid-cols-1">

              <button
                type="button"
                className={secondaryButton}
                onClick={close}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className={primaryButton}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editing
                  ? "Update product"
                  : "Save product"}
              </button>

            </div>

          </form>
        </section>
      )}

      {/* PRODUCTS */}
      {!showForm && (
        <>

          {/* TOOLBAR */}
          <section className="grid grid-cols-[minmax(220px,1fr)_160px_160px_auto] items-center gap-[9px] mb-[13px] p-[11px] border border-[#232839] rounded-[9px] bg-[#121620] max-[1200px]:grid-cols-[minmax(200px,1fr)_145px_145px_auto] max-[900px]:grid-cols-[minmax(200px,1fr)_minmax(130px,.5fr)] max-[650px]:grid-cols-2 max-[420px]:grid-cols-1">

            <input
              className={`${inputClass} h-[34px] max-[900px]:col-span-full max-[650px]:col-span-full max-[420px]:col-auto`}
              placeholder="Search by product name or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>

              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              className={selectClass}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            >
              <option value="">All stock levels</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>

            <button
              className="h-[34px] px-2.5 border border-[#2c3246] rounded-[7px] bg-[#1a1f2e] text-[#aeb6d1] text-[9px] font-bold whitespace-nowrap cursor-pointer hover:border-[#4945a0] hover:bg-[#202441] hover:text-[#aaa8ff] max-[900px]:w-full max-[650px]:col-span-full max-[420px]:col-auto"
              onClick={() => {
                setSearch("");
                setCategory("");
                setStock("");
              }}
            >
              Clear filters
            </button>

          </section>

          {/* TABLE */}
          <section className="w-full min-w-0 overflow-hidden border border-[#232839] rounded-[10px] bg-[#121620]">

            <div className="min-h-[54px] flex items-center justify-between gap-[15px] px-[15px] py-3 border-b border-[#232839] max-[650px]:min-h-[49px] max-[650px]:px-[11px] max-[650px]:py-2.5">

              <div>
                <h2 className="m-0 mb-[3px] text-[13px] text-[#f0f1f6] max-[420px]:text-[11px]">
                  Product catalog
                </h2>

                <p className="m-0 text-[8px] text-[#7c86a5]">
                  {filtered.length} of {products.length} products shown
                </p>
              </div>

            </div>

            {filtered.length === 0 ? (
              <div className="min-h-[180px] flex flex-col items-center justify-center px-[18px] py-[30px] text-center text-[#7c86a5]">

                <h3 className="m-0 mb-[5px] text-[12px] text-[#e8eaf2]">
                  No matching products
                </h3>

                <p className="m-0 text-[9px]">
                  Try changing your search or filters.
                </p>

              </div>
            ) : (
              <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">

                <table className="w-full min-w-[920px] border-collapse border-spacing-0 table-fixed max-[1200px]:min-w-[900px] max-[900px]:min-w-[850px] max-[650px]:min-w-[820px] max-[420px]:min-w-[780px]">

                  <thead>
                    <tr>
                      <th className="w-[22%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-left text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        Product
                      </th>

                      <th className="w-[10%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-left text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        SKU
                      </th>

                      <th className="w-[11%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-left text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        Category
                      </th>

                      <th className="w-[9%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-left text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        Cost
                      </th>

                      <th className="w-[9%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-left text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        Price
                      </th>

                      <th className="w-[8%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-center text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        On hand
                      </th>

                      <th className="w-[9%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-center text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        Min. stock
                      </th>

                      <th className="w-[11%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-left text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        Status
                      </th>

                      <th className="w-[11%] h-9 px-2.5 border-b border-[#232839] bg-[#10131a] text-left text-[7px] font-extrabold tracking-[0.5px] text-[#747e9d] uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {filtered.map((p) => {
                      const q = Number(p.quantity || 0);
                      const min = Number(p.minimumStock || 0);

                      const out = q === 0;
                      const low = q > 0 && q <= min;

                      return (
                        <tr
                          key={p._id}
                          className="bg-transparent hover:bg-[#171b27]"
                        >

                          {/* PRODUCT */}
                          <td className="h-[51px] px-2.5 border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap">

                            <div className="w-full min-w-0 flex items-center gap-2">

                              <span className="w-7 h-7 shrink-0 grid place-items-center rounded-[7px] bg-[#202441] text-[#918eff] text-[10px] font-extrabold">
                                {p.name?.slice(0, 1).toUpperCase()}
                              </span>

                              <div className="min-w-0 flex flex-col gap-px overflow-hidden">

                                <strong className="block max-w-full overflow-hidden text-[#dfe2ec] text-[9px] font-bold text-ellipsis whitespace-nowrap">
                                  {p.name}
                                </strong>

                                <small className="block max-w-full overflow-hidden text-[#69738f] text-[7px] leading-[1.3] text-ellipsis whitespace-nowrap">
                                  {p.description || "No description"}
                                </small>

                              </div>
                            </div>

                          </td>

                          <td className="h-[51px] px-2.5 border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap">
                            {p.sku}
                          </td>

                          <td className="h-[51px] px-2.5 border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap">
                            {p.category}
                          </td>

                          <td className="h-[51px] px-2.5 border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap">
                            <span className="text-[#69738f] text-[7px] font-bold">
                              PKR{" "}
                            </span>
                            {Number(p.costPrice).toFixed(2)}
                          </td>

                          <td className="h-[51px] px-2.5 border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap">
                            <span className="text-[#69738f] text-[7px] font-bold">
                              PKR{" "}
                            </span>
                            {Number(p.sellingPrice).toFixed(2)}
                          </td>

                          <td className="h-[51px] px-2.5 border-b border-[#202637] text-center text-[#adb5ca] text-[9px]">
                            {q}
                          </td>

                          <td className="h-[51px] px-2.5 border-b border-[#202637] text-center text-[#adb5ca] text-[9px]">
                            {min}
                          </td>

                          {/* STATUS */}
                          <td className="h-[51px] px-2.5 border-b border-[#202637]">

                            <span
                              className={`inline-block max-w-full px-[7px] py-1 rounded-full border text-[7px] font-bold leading-[1.2] whitespace-nowrap ${
                                out
                                  ? "border-[#68323a] bg-[#2d181e] text-[#f46b78]"
                                  : low
                                  ? "border-[#704606] bg-[#302409] text-[#f5b719]"
                                  : "border-[#075844] bg-[#07372d] text-[#00c995]"
                              }`}
                            >
                              {out
                                ? "Out of stock"
                                : low
                                ? "Low stock"
                                : "In stock"}
                            </span>

                          </td>

                          {/* ACTIONS */}
                          <td className="h-[51px] px-2.5 border-b border-[#202637]">

                            <div className="flex items-center gap-[5px]">

                              <button
                                className="min-h-[26px] px-[7px] border border-[#4945a0] rounded-[6px] bg-transparent text-[#9592ff] text-[7px] font-bold cursor-pointer hover:bg-[#202441]"
                                onClick={() => openEdit(p)}
                              >
                                Edit
                              </button>

                              <button
                                className="min-h-[26px] px-[7px] border border-[#63343c] rounded-[6px] bg-transparent text-[#f07b86] text-[7px] font-bold cursor-pointer hover:bg-[#2b181e]"
                                onClick={() => remove(p._id)}
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>
              </div>
            )}

          </section>
        </>
      )}
    </main>
  );
}