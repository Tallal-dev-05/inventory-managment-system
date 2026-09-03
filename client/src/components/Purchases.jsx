import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPKR } from "../utils/currency";
import { api } from "../utils/api";

const getToday = () => new Date().toISOString().split("T")[0];

const emptyPurchaseForm = {
  productId: "",
  supplierName: "",
  quantity: "",
  costPrice: "",
  purchaseDate: getToday(),
  notes: "",
};

function Purchases() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState(emptyPurchaseForm);

  // ==========================================
  // GET PRODUCTS
  // ==========================================

  async function getProducts() {
    try {
      const response = await fetch(api("/api/products"), {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get products");
      }

      setProducts(data.products || []);
    } catch (error) {
      setError(error.message);
    }
  }

  // ==========================================
  // GET PURCHASES
  // ==========================================

  async function getPurchases() {
    try {
      const response = await fetch(api("/api/purchases"), {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get purchases");
      }

      setPurchases(data.purchases || []);
    } catch (error) {
      setError(error.message);
    }
  }

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      await Promise.all([
        getProducts(),
        getPurchases(),
      ]);

      setLoading(false);
    }

    loadData();
  }, []);

  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  // ==========================================
  // PRODUCT SELECT
  // ==========================================

  function handleProductChange(event) {
    const productId = event.target.value;

    const selectedProduct = products.find(
      (product) => product._id === productId
    );

    setFormData((previous) => ({
      ...previous,
      productId,
      costPrice: selectedProduct
        ? selectedProduct.costPrice
        : "",
    }));

    setError("");
    setSuccess("");
  }

  // ==========================================
  // CALCULATE TOTAL
  // ==========================================

  const totalAmount =
    Number(formData.quantity || 0) *
    Number(formData.costPrice || 0);

  // ==========================================
  // SUBMIT PURCHASE
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.productId) {
      setError("Please select a product");
      return;
    }

    if (!formData.supplierName.trim()) {
      setError("Please enter supplier name");
      return;
    }

    if (
      !formData.quantity ||
      Number(formData.quantity) <= 0
    ) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (
      formData.costPrice === "" ||
      Number(formData.costPrice) < 0
    ) {
      setError("Please enter a valid cost price");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(api("/api/purchases"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: formData.productId,
          supplierName: formData.supplierName,
          quantity: Number(formData.quantity),
          costPrice: Number(formData.costPrice),
          purchaseDate: formData.purchaseDate || undefined,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create purchase"
        );
      }

      setSuccess("Purchase created successfully!");

      setFormData(emptyPurchaseForm);

      setShowForm(false);

      await Promise.all([
        getProducts(),
        getPurchases(),
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // CANCEL FORM
  // ==========================================

  function cancelForm() {
    setShowForm(false);

    setFormData(emptyPurchaseForm);

    setError("");
    setSuccess("");
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b0e13] text-[#e8eaf2] flex flex-col items-center justify-center gap-3 font-sans text-[10px]">
        <div className="h-8 w-8 rounded-full border-[3px] border-[#232839] border-t-[#6865f5] animate-spin" />
        <p className="text-[#7c86a5] font-semibold">
          Loading purchases...
        </p>
      </div>
    );
  }

  // ==========================================
  // SHARED CLASSES
  // ==========================================

  const inputClass =
    "w-full min-w-0 h-[34px] px-[10px] border border-[#232839] rounded-[7px] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] transition-all focus:border-[#6865f5] focus:ring-[3px] focus:ring-[#6865f5]/15 placeholder:text-[#5f6882]";

  const labelClass =
    "text-[#aeb5ca] text-[9px] font-bold";

  const primaryButton =
    "min-h-[34px] px-[13px] rounded-[7px] border border-[#6865f5] bg-[#6865f5] text-white text-[9px] font-bold cursor-pointer transition-all hover:bg-[#7773ff] hover:border-[#7773ff] hover:-translate-y-[1px] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none";

  const secondaryButton =
    "min-h-[34px] px-[13px] rounded-[7px] border border-[#2c3246] bg-[#1a1f2e] text-[#bbc2db] text-[9px] font-bold cursor-pointer transition-all hover:border-[#3a425a] hover:bg-[#22283a] disabled:opacity-55 disabled:cursor-not-allowed";

  return (
    <div className="w-full min-h-screen m-0 px-[26px] pt-[22px] pb-[30px] bg-[#0b0e13] text-[#e8eaf2] font-sans text-[11px] overflow-x-hidden">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="min-h-[64px] flex items-start justify-between gap-[18px] mb-[20px] pb-[17px] border-b border-[#232839]">

        <div>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="p-0 border-0 bg-transparent text-[#8582ff] text-[9px] font-bold cursor-pointer hover:text-[#aaa8ff]"
          >
            ← <span className="ml-[3px]">Back to dashboard</span>
          </button>

          <h1 className="mt-[7px] mb-[3px] text-[#f2f3f7] text-[20px] leading-[1.2] tracking-[-0.5px] font-semibold">
            Purchases
          </h1>

          <p className="m-0 text-[#7c86a5] text-[10px] leading-[1.5]">
            Record products received from suppliers
          </p>
        </div>

        <button
          className={primaryButton}
          onClick={() => {
            setShowForm(true);
            setError("");
            setSuccess("");
          }}
        >
          + Add Purchase
        </button>
      </div>

      {/* ==========================================
          SUCCESS
      ========================================== */}

      {success && (
        <div className="mb-[15px] px-[12px] py-[10px] border border-[#075844] rounded-[7px] bg-[#07372d] text-[#00c995] text-[9px] leading-[1.5]">
          {success}
        </div>
      )}

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="mb-[15px] px-[12px] py-[10px] border border-[#64323c] rounded-[7px] bg-[#28171d] text-[#ff8b96] text-[9px] leading-[1.5]">
          {error}
        </div>
      )}

      {/* ==========================================
          ADD PURCHASE FORM
      ========================================== */}

      {showForm && (
        <div className="mb-[18px] p-[17px] border border-[#232839] rounded-[10px] bg-[#121620]">

          <div className="flex items-start justify-between gap-[16px] mb-[15px] pb-[12px] border-b border-[#232839]">

            <div>
              <h2 className="m-0 text-[#f0f1f6] text-[14px] leading-[1.3] font-semibold">
                Add Purchase
              </h2>
            </div>

            <button
              type="button"
              onClick={cancelForm}
              aria-label="Close"
              className="w-[27px] h-[27px] grid place-items-center shrink-0 p-0 border border-[#2b3144] rounded-[7px] bg-[#1a1f2e] text-[#9aa3bf] text-[18px] leading-none cursor-pointer hover:border-[#63343c] hover:bg-[#2a181e] hover:text-[#f46b78]"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[13px]">

              {/* PRODUCT */}

              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>
                  Product *
                </label>

                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleProductChange}
                  required
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                      className="bg-[#121620] text-[#e8eaf2]"
                    >
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* SUPPLIER */}

              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>
                  Supplier Name *
                </label>

                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  required
                  className={inputClass}
                />
              </div>

              {/* QUANTITY */}

              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>
                  Quantity *
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  min="1"
                  step="1"
                  required
                  className={inputClass}
                />
              </div>

              {/* COST PRICE */}

              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>
                  Cost Price (PKR) *
                </label>

                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  placeholder="Enter cost price"
                  min="0"
                  step="0.01"
                  required
                  className={inputClass}
                />
              </div>

              {/* PURCHASE DATE */}

              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>
                  Purchase Date
                </label>

                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>

              {/* TOTAL */}

              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>
                  Total Amount (PKR)
                </label>

                <input
                  type="text"
                  value={formatPKR(totalAmount)}
                  readOnly
                  className="w-full h-[34px] px-[10px] border border-[#2c3246] rounded-[7px] outline-none bg-[#181c28] text-[#00c995] text-[10px] font-bold cursor-default"
                />
              </div>

              {/* NOTES */}

              <div className="min-w-0 flex flex-col gap-[5px] md:col-span-2 lg:col-span-3">
                <label className={labelClass}>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Optional notes"
                  rows="3"
                  className={`${inputClass} h-auto min-h-[65px] py-[9px] leading-[1.5] resize-y`}
                />
              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="flex justify-end gap-[8px] mt-[16px] pt-[13px] border-t border-[#232839]">

              <button
                type="button"
                className={secondaryButton}
                onClick={cancelForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={primaryButton}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Purchase"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ==========================================
          PURCHASE HISTORY
      ========================================== */}

      <div className="w-full min-w-0 overflow-hidden border border-[#232839] rounded-[10px] bg-[#121620]">

        {/* TABLE HEADER */}

        <div className="min-h-[54px] flex items-center justify-between gap-[15px] px-[15px] py-[12px] border-b border-[#232839]">

          <h2 className="m-0 text-[#f0f1f6] text-[13px] font-semibold">
            Purchase History
          </h2>

          <span className="shrink-0 px-[8px] py-[4px] rounded-full bg-[#202441] text-[#9592ff] text-[8px] font-bold">
            {purchases.length} purchase
            {purchases.length !== 1 ? "s" : ""}
          </span>

        </div>

        {/* EMPTY */}

        {purchases.length === 0 ? (
          <div className="min-h-[180px] flex flex-col items-center justify-center px-[18px] py-[30px] text-center text-[#7c86a5]">

            <h3 className="m-0 mb-[5px] text-[#e8eaf2] text-[12px] font-semibold">
              No purchases found
            </h3>

            <p className="m-0 text-[9px]">
              Click "Add Purchase" to record your first purchase.
            </p>

          </div>
        ) : (

          /* TABLE */

          <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">

            <table className="w-full min-w-[900px] table-fixed border-spacing-0 border-collapse">

              <thead>
                <tr>

                  <th className="w-[17%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Product
                  </th>

                  <th className="w-[10%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    SKU
                  </th>

                  <th className="w-[15%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Supplier
                  </th>

                  <th className="w-[9%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-center text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Quantity
                  </th>

                  <th className="w-[13%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Cost Price (PKR)
                  </th>

                  <th className="w-[13%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Total (PKR)
                  </th>

                  <th className="w-[11%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Date
                  </th>

                  <th className="w-[12%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Notes
                  </th>

                </tr>
              </thead>

              <tbody>

                {purchases.map((purchase) => (
                  <tr
                    key={purchase._id}
                    className="bg-transparent hover:bg-[#171b27] transition-colors"
                  >

                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#dfe2ec] text-[9px] font-bold whitespace-nowrap text-ellipsis">
                      {purchase.product?.name ||
                        "Unknown Product"}
                    </td>

                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#7e89a8] text-[9px] font-mono whitespace-nowrap text-ellipsis">
                      {purchase.product?.sku || "-"}
                    </td>

                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap text-ellipsis">
                      {purchase.supplierName}
                    </td>

                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#e1e4ed] text-[9px] font-bold text-center whitespace-nowrap">
                      {purchase.quantity}
                    </td>

                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#c0c7db] text-[9px] whitespace-nowrap text-ellipsis">
                      {formatPKR(purchase.costPrice)}
                    </td>

                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#00c995] text-[9px] font-bold whitespace-nowrap text-ellipsis">
                      {formatPKR(purchase.totalAmount)}
                    </td>

                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap">
                      {purchase.purchaseDate
                        ? new Date(
                            purchase.purchaseDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#7c86a5] text-[9px] whitespace-nowrap text-ellipsis">
                      {purchase.notes || "-"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </div>
  );
}

export default Purchases;