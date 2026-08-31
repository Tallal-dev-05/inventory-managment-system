import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Purchases.css";
import { formatPKR } from "../utils/currency";
import { api } from "../utils/api";

function Purchases() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    productId: "",
    supplierName: "",
    quantity: "",
    costPrice: "",
    purchaseDate: "",
    notes: "",
  });

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

      // Reset form
      setFormData({
        productId: "",
        supplierName: "",
        quantity: "",
        costPrice: "",
        purchaseDate: "",
        notes: "",
      });

      setShowForm(false);

      // Reload products and purchases
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

    setFormData({
      productId: "",
      supplierName: "",
      quantity: "",
      costPrice: "",
      purchaseDate: "",
      notes: "",
    });

    setError("");
    setSuccess("");
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="purchases-page">
        <h1>Purchases</h1>
        <p>Loading purchases...</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="purchases-page">

      {/* HEADER */}

      <div className="purchases-header">
        <div>
          <button className="dashboard-back-button" type="button" onClick={() => navigate("/admin")}>Back to dashboard</button>
          <h1 className="purchases-title">
            Purchases
          </h1>

          <p className="purchases-subtitle">
            Record products received from suppliers
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowForm(true);
            setError("");
            setSuccess("");
          }}
        >
          + Add Purchase
        </button>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="success-box">
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* ======================================
          ADD PURCHASE FORM
      ====================================== */}

      {showForm && (
        <div className="purchase-form-card">

          <div className="purchase-form-header">
            <h2>Add Purchase</h2>

            <button
              type="button"
              className="close-button"
              onClick={cancelForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="purchase-form-grid">

              {/* PRODUCT */}

              <div className="form-field">
                <label>
                  Product *
                </label>

                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleProductChange}
                  required
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product._id}
                      value={product._id}
                    >
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* SUPPLIER */}

              <div className="form-field">
                <label>
                  Supplier Name *
                </label>

                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              {/* QUANTITY */}

              <div className="form-field">
                <label>
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
                />
              </div>

              {/* COST PRICE */}

              <div className="form-field">
                <label>
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
                />
              </div>

              {/* PURCHASE DATE */}

              <div className="form-field">
                <label>
                  Purchase Date
                </label>

                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>

              {/* TOTAL */}

              <div className="form-field">
                <label>
                  Total Amount (PKR)
                </label>

                <input
                  type="text"
                  value={formatPKR(totalAmount)}
                  readOnly
                />
              </div>

              {/* NOTES */}

              <div className="form-field full-width">
                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Optional notes"
                  rows="3"
                />
              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={cancelForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Purchase"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* ======================================
          PURCHASE HISTORY
      ====================================== */}

      <div className="purchases-table-card">

        <div className="table-header">
          <h2>Purchase History</h2>

          <span>
            {purchases.length} purchase
            {purchases.length !== 1 ? "s" : ""}
          </span>
        </div>

        {purchases.length === 0 ? (
          <div className="empty-state">
            <h3>No purchases found</h3>

            <p>
              Click "Add Purchase" to record your
              first purchase.
            </p>
          </div>
        ) : (
          <div className="purchases-table-wrapper">

            <table className="purchases-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Cost Price (PKR)</th>
                  <th>Total (PKR)</th>
                  <th>Date</th>
                  <th>Notes</th>
                </tr>
              </thead>

              <tbody>

                {purchases.map((purchase) => (
                  <tr key={purchase._id}>

                    <td>
                      {purchase.product?.name ||
                        "Unknown Product"}
                    </td>

                    <td>
                      {purchase.product?.sku ||
                        "-"}
                    </td>

                    <td>
                      {purchase.supplierName}
                    </td>

                    <td>
                      {purchase.quantity}
                    </td>

                    <td>
                      {formatPKR(purchase.costPrice)}
                    </td>

                    <td>
                      {formatPKR(purchase.totalAmount)}
                    </td>

                    <td>
                      {purchase.purchaseDate
                        ? new Date(
                            purchase.purchaseDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
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
