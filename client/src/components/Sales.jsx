import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./Sales.css";
import { formatPKR } from "../utils/currency";

const emptyForm = {
  productId: "",
  customerName: "",
  quantity: "",
  sellingPrice: "",
  saleDate: "",
  notes: "",
};

// ==========================================
// DOWNLOAD INVOICE PDF
// ==========================================

function downloadInvoice(sale) {
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const money = (value) =>
    `PKR ${Number(value || 0).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const invoiceNumber = sale?._id
    ? sale._id.slice(-8).toUpperCase()
    : "DRAFT";

  const date = sale?.saleDate
    ? new Date(sale.saleDate).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-PK");

  const productName =
    sale?.product?.name || "Unknown Product";

  // ==========================================
  // HEADER
  // ==========================================

  pdf.setFillColor(25, 166, 106);
  pdf.rect(0, 0, 210, 34, "F");

  pdf.setTextColor(255, 255, 255);

  pdf.setFontSize(22);
  pdf.text("INVENTORY", 18, 19);

  pdf.setFontSize(10);
  pdf.text("Sales invoice", 18, 26);

  pdf.setFontSize(14);
  pdf.text("INVOICE", 192, 19, {
    align: "right",
  });

  pdf.setFontSize(9);
  pdf.text(`#${invoiceNumber}`, 192, 26, {
    align: "right",
  });

  // ==========================================
  // CUSTOMER INFORMATION
  // ==========================================

  pdf.setTextColor(29, 41, 57);

  pdf.setFontSize(11);
  pdf.text("Bill to", 18, 49);

  pdf.setFontSize(14);
  pdf.text(
    sale?.customerName || "Walk-in Customer",
    18,
    57
  );

  pdf.setFontSize(10);
  pdf.setTextColor(102, 112, 133);

  pdf.text(`Invoice date: ${date}`, 192, 49, {
    align: "right",
  });

  pdf.text(
    `SKU: ${sale?.product?.sku || "-"}`,
    192,
    56,
    {
      align: "right",
    }
  );

  // ==========================================
  // TABLE HEADER
  // ==========================================

  pdf.setFillColor(242, 248, 245);
  pdf.rect(18, 70, 174, 10, "F");

  pdf.setTextColor(52, 67, 74);
  pdf.setFontSize(9);

  pdf.text("DESCRIPTION", 22, 76.5);
  pdf.text("QTY", 120, 76.5);
  pdf.text("UNIT PRICE", 142, 76.5);

  pdf.text("TOTAL", 188, 76.5, {
    align: "right",
  });

  // ==========================================
  // PRODUCT
  // ==========================================

  pdf.setTextColor(29, 41, 57);
  pdf.setFontSize(10);

  pdf.text(productName, 22, 90);

  pdf.text(
    String(sale?.quantity || 0),
    120,
    90
  );

  pdf.text(
    money(sale?.sellingPrice),
    142,
    90
  );

  pdf.text(
    money(sale?.totalAmount),
    188,
    90,
    {
      align: "right",
    }
  );

  pdf.setDrawColor(224, 231, 235);
  pdf.line(18, 97, 192, 97);

  // ==========================================
  // TOTAL
  // ==========================================

  pdf.setFontSize(11);
  pdf.text("Total due", 142, 112);

  pdf.setTextColor(25, 166, 106);
  pdf.setFontSize(16);

  pdf.text(
    money(sale?.totalAmount),
    192,
    112,
    {
      align: "right",
    }
  );

  // ==========================================
  // NOTES
  // ==========================================

  if (sale?.notes) {
    pdf.setTextColor(102, 112, 133);
    pdf.setFontSize(9);

    pdf.text("Notes", 18, 126);

    const notes = pdf.splitTextToSize(
      sale.notes,
      170
    );

    pdf.text(notes, 18, 133);
  }

  // ==========================================
  // FOOTER
  // ==========================================

  pdf.setTextColor(102, 112, 133);
  pdf.setFontSize(9);

  pdf.text(
    "Thank you for your business.",
    105,
    276,
    {
      align: "center",
    }
  );

  pdf.save(
    `invoice-${invoiceNumber}.pdf`
  );
}

// ==========================================
// SALES COMPONENT
// ==========================================

function Sales() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] =
    useState(emptyForm);

  // ==========================================
  // CURRENT INVOICE
  // ==========================================

  const [invoiceSale, setInvoiceSale] =
    useState(null);

  // ==========================================
  // EDIT MODE
  // ==========================================

  const [editingSaleId, setEditingSaleId] =
    useState(null);

  // ==========================================
  // GET PRODUCTS
  // ==========================================

  async function getProducts() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/products",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to get products"
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      setError(error.message);
    }
  }

  // ==========================================
  // GET COMPLETED SALES
  // ==========================================

  async function getSales() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/sales",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to get sales"
        );
      }

      setSales(data.sales || []);
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
        getSales(),
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
  // PRODUCT CHANGE
  // ==========================================

  function handleProductChange(event) {
    const productId = event.target.value;

    const selectedProduct = products.find(
      (product) =>
        product._id === productId
    );

    setFormData((previous) => ({
      ...previous,
      productId,

      sellingPrice: selectedProduct
        ? selectedProduct.sellingPrice
        : "",
    }));

    setError("");
    setSuccess("");
  }

  // ==========================================
  // SELECTED PRODUCT
  // ==========================================

  const selectedProduct = products.find(
    (product) =>
      product._id === formData.productId
  );

  // ==========================================
  // TOTAL AMOUNT
  // ==========================================

  const totalAmount =
    Number(formData.quantity || 0) *
    Number(formData.sellingPrice || 0);

  // ==========================================
  // ESTIMATED PROFIT
  // ==========================================

  const estimatedProfit =
    Number(formData.quantity || 0) *
    (
      Number(formData.sellingPrice || 0) -
      Number(
        selectedProduct?.costPrice || 0
      )
    );

  // ==========================================
  // SAVE / UPDATE SALE
  // ==========================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // VALIDATION
    // ========================================

    if (!formData.productId) {
      setError(
        "Please select a product"
      );
      return;
    }

    if (!formData.quantity) {
      setError(
        "Please enter quantity"
      );
      return;
    }

    if (
      !Number.isInteger(
        Number(formData.quantity)
      ) ||
      Number(formData.quantity) <= 0
    ) {
      setError(
        "Quantity must be a positive whole number"
      );
      return;
    }

    if (
      selectedProduct &&
      Number(formData.quantity) >
        Number(selectedProduct.quantity)
    ) {
      setError(
        `Insufficient stock. Available stock: ${selectedProduct.quantity}`
      );
      return;
    }

    if (
      formData.sellingPrice === "" ||
      Number(formData.sellingPrice) < 0
    ) {
      setError(
        "Please enter a valid selling price"
      );
      return;
    }

    try {
      setSaving(true);

      // ========================================
      // DETERMINE METHOD AND URL
      // ========================================

      const isEditing =
        Boolean(editingSaleId);

      const url = isEditing
        ? `http://localhost:5000/api/sales/${editingSaleId}`
        : "http://localhost:5000/api/sales";

      const method = isEditing
        ? "PUT"
        : "POST";

      // ========================================
      // REQUEST
      // ========================================

      const response = await fetch(
        url,
        {
          method,

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId:
              formData.productId,

            customerName:
              formData.customerName.trim(),

            quantity:
              Number(formData.quantity),

            sellingPrice:
              Number(
                formData.sellingPrice
              ),

            saleDate:
              formData.saleDate ||
              undefined,

            notes:
              formData.notes.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (
              isEditing
                ? "Failed to update sale"
                : "Failed to create sale"
            )
        );
      }

      // ========================================
      // GET UPDATED SALE
      // ========================================

      const updatedSale =
        data.sale;

      if (!updatedSale) {
        throw new Error(
          "Sale information was not returned by the server."
        );
      }

      // ========================================
      // RESET FORM
      // ========================================

      setFormData(emptyForm);

      setShowForm(false);

      setEditingSaleId(null);

      // ========================================
      // OPEN INVOICE
      // ========================================

      setInvoiceSale(updatedSale);

      // ========================================
      // REFRESH PRODUCTS
      // ========================================

      await getProducts();

      if (isEditing) {
        setSuccess(
          "Sale updated. Please review the invoice again."
        );
      } else {
        setSuccess(
          "Sale saved. Please review the invoice."
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // EDIT INVOICE
  // ==========================================

  function handleEditInvoice() {
    if (!invoiceSale) {
      return;
    }

    // ========================================
    // GET PRODUCT ID
    // ========================================

    const productId =
      invoiceSale.product?._id ||
      invoiceSale.product;

    // ========================================
    // CONVERT DATE
    // ========================================

    let saleDate = "";

    if (invoiceSale.saleDate) {
      const date =
        new Date(invoiceSale.saleDate);

      if (!Number.isNaN(date.getTime())) {
        saleDate = date
          .toISOString()
          .split("T")[0];
      }
    }

    // ========================================
    // LOAD SALE INTO FORM
    // ========================================

    setFormData({
      productId:
        productId || "",

      customerName:
        invoiceSale.customerName ===
        "Walk-in Customer"
          ? ""
          : invoiceSale.customerName || "",

      quantity:
        invoiceSale.quantity || "",

      sellingPrice:
        invoiceSale.sellingPrice ?? "",

      saleDate,

      notes:
        invoiceSale.notes || "",
    });

    // ========================================
    // SET EDIT MODE
    // ========================================

    setEditingSaleId(
      invoiceSale._id
    );

    // ========================================
    // CLOSE INVOICE
    // ========================================

    setInvoiceSale(null);

    // ========================================
    // OPEN FORM
    // ========================================

    setShowForm(true);

    setError("");

    setSuccess("");
  }

  // ==========================================
  // DONE / FINALIZE SALE
  // ==========================================

  async function handleDoneInvoice() {
    if (!invoiceSale?._id) {
      setError(
        "Invalid sale. Cannot finalize."
      );
      return;
    }

    try {
      setFinalizing(true);

      setError("");

      const response =
        await fetch(
          `http://localhost:5000/api/sales/${invoiceSale._id}/finalize`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to finalize sale"
        );
      }

      // ========================================
      // CLOSE INVOICE
      // ========================================

      setInvoiceSale(null);

      // ========================================
      // REFRESH PRODUCTS + SALES
      // ========================================

      await Promise.all([
        getProducts(),
        getSales(),
      ]);

      setSuccess(
        "Sale completed successfully!"
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setFinalizing(false);
    }
  }

  // ==========================================
  // CANCEL FORM
  // ==========================================

  function cancelForm() {
    setShowForm(false);

    setFormData(emptyForm);

    setEditingSaleId(null);

    setError("");

    setSuccess("");
  }

  // ==========================================
  // CLOSE INVOICE
  // ==========================================

  function closeInvoice() {
    setInvoiceSale(null);
  }

  // ==========================================
  // OPEN NEW SALE
  // ==========================================

  function openNewSale() {
    setShowForm(true);

    setEditingSaleId(null);

    setFormData(emptyForm);

    setError("");

    setSuccess("");
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="sales-page">
        <h1>Sales</h1>

        <p>
          Loading sales...
        </p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="sales-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="sales-header">

        <div>

          <button
            className="dashboard-back-button"
            type="button"
            onClick={() =>
              navigate("/admin")
            }
          >
            Back to dashboard
          </button>

          <h1 className="sales-title">
            Sales
          </h1>

          <p className="sales-subtitle">
            Record products sold to
            customers
          </p>

        </div>

        <button
          className="primary-button"
          onClick={openNewSale}
        >
          + Add Sale
        </button>

      </div>

      {/* ======================================
          SUCCESS
      ====================================== */}

      {success && (
        <div className="success-box">
          {success}
        </div>
      )}

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {/* ======================================
          ADD / EDIT SALE FORM
      ====================================== */}

      {showForm && (
        <div className="sale-form-card">

          <div className="sale-form-header">

            <h2>
              {editingSaleId
                ? "Edit Sale"
                : "Add Sale"}
            </h2>

            <button
              type="button"
              className="close-button"
              onClick={cancelForm}
              disabled={saving}
            >
              ×
            </button>

          </div>

          <form
            onSubmit={handleSubmit}
          >

            <div className="sale-form-grid">

              {/* PRODUCT */}

              <div className="form-field">

                <label>
                  Product *
                </label>

                <select
                  name="productId"
                  value={
                    formData.productId
                  }
                  onChange={
                    handleProductChange
                  }
                  required
                >

                  <option value="">
                    Select product
                  </option>

                  {products.map(
                    (product) => (
                      <option
                        key={product._id}
                        value={product._id}
                      >
                        {product.name} (
                        {product.sku})
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* CUSTOMER */}

              <div className="form-field">

                <label>
                  Customer Name
                </label>

                <input
                  type="text"
                  name="customerName"
                  value={
                    formData.customerName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Walk-in Customer"
                />

              </div>

              {/* AVAILABLE STOCK */}

              <div className="form-field">

                <label>
                  Available Stock
                </label>

                <input
                  type="text"
                  value={
                    selectedProduct
                      ? selectedProduct.quantity
                      : "-"
                  }
                  readOnly
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
                  value={
                    formData.quantity
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter quantity"
                  min="1"
                  step="1"
                  required
                />

              </div>

              {/* SELLING PRICE */}

              <div className="form-field">

                <label>
                  Selling Price (PKR) *
                </label>

                <input
                  type="number"
                  name="sellingPrice"
                  value={
                    formData.sellingPrice
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter selling price"
                  min="0"
                  step="0.01"
                  required
                />

              </div>

              {/* TOTAL */}

              <div className="form-field">

                <label>
                  Total Amount (PKR)
                </label>

                <input
                  type="text"
                  value={formatPKR(
                    totalAmount
                  )}
                  readOnly
                />

              </div>

              {/* PROFIT */}

              <div className="form-field">

                <label>
                  Estimated Profit (PKR)
                </label>

                <input
                  type="text"
                  value={formatPKR(
                    estimatedProfit
                  )}
                  readOnly
                />

              </div>

              {/* SALE DATE */}

              <div className="form-field">

                <label>
                  Sale Date
                </label>

                <input
                  type="date"
                  name="saleDate"
                  value={
                    formData.saleDate
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* NOTES */}

              <div className="form-field full-width">

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Optional notes"
                  rows="3"
                />

              </div>

            </div>

            {/* ==================================
                FORM BUTTONS
            ================================== */}

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
                  ? editingSaleId
                    ? "Updating..."
                    : "Saving..."
                  : editingSaleId
                  ? "Update Sale"
                  : "Save Sale"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ======================================
          SALES HISTORY
      ====================================== */}

      <div className="sales-table-card">

        <div className="table-header">

          <h2>
            Sales History
          </h2>

          <span>
            {sales.length} sale
            {sales.length !== 1
              ? "s"
              : ""}
          </span>

        </div>

        {sales.length === 0 ? (

          <div className="empty-state">

            <h3>
              No sales found
            </h3>

            <p>
              Click "Add Sale" to
              record your first
              sale.
            </p>

          </div>

        ) : (

          <div className="sales-table-wrapper">

            <table className="sales-table">

              <thead>

                <tr>

                  <th>
                    Product
                  </th>

                  <th>
                    SKU
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Selling Price (PKR)
                  </th>

                  <th>
                    Total (PKR)
                  </th>

                  <th>
                    Profit (PKR)
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Notes
                  </th>

                  <th>
                    Invoice
                  </th>

                </tr>

              </thead>

              <tbody>

                {sales.map(
                  (sale) => (

                    <tr
                      key={sale._id}
                    >

                      <td>
                        {sale.product?.name ||
                          "Unknown Product"}
                      </td>

                      <td>
                        {sale.product?.sku ||
                          "-"}
                      </td>

                      <td>
                        {sale.customerName ||
                          "Walk-in Customer"}
                      </td>

                      <td>
                        {sale.quantity}
                      </td>

                      <td>
                        {formatPKR(
                          sale.sellingPrice
                        )}
                      </td>

                      <td>
                        {formatPKR(
                          sale.totalAmount
                        )}
                      </td>

                      <td>
                        {formatPKR(
                          sale.profit
                        )}
                      </td>

                      <td>
                        {sale.saleDate
                          ? new Date(
                              sale.saleDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {sale.notes ||
                          "-"}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="invoice-button"
                          onClick={() =>
                            downloadInvoice(
                              sale
                            )
                          }
                        >
                          Download
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ======================================
          INVOICE REVIEW MODAL
      ====================================== */}

      {invoiceSale && (

        <div className="invoice-modal-overlay">

          <div className="invoice-modal">

            {/* ==================================
                MODAL HEADER
            ================================== */}

            <div className="invoice-modal-header">

              <div>

                <h2>
                  Review Invoice
                </h2>

                <p>
                  Check the invoice
                  before completing
                  the sale.
                </p>

              </div>

              <button
                type="button"
                className="close-button"
                onClick={
                  closeInvoice
                }
                disabled={
                  finalizing
                }
              >
                ×
              </button>

            </div>

            {/* ==================================
                INVOICE PREVIEW
            ================================== */}

            <div className="invoice-preview">

              {/* INVOICE HEADER */}

              <div className="invoice-preview-top">

                <div>

                  <h1>
                    INVENTORY
                  </h1>

                  <p>
                    Sales Invoice
                  </p>

                </div>

                <div className="invoice-number">

                  <strong>
                    INVOICE
                  </strong>

                  <span>
                    #
                    {invoiceSale._id
                      ? invoiceSale._id
                          .slice(-8)
                          .toUpperCase()
                      : "DRAFT"}
                  </span>

                </div>

              </div>

              {/* BILL TO / DATE */}

              <div className="invoice-info">

                <div>

                  <span>
                    Bill To
                  </span>

                  <strong>
                    {invoiceSale.customerName ||
                      "Walk-in Customer"}
                  </strong>

                </div>

                <div>

                  <span>
                    Invoice Date
                  </span>

                  <strong>

                    {invoiceSale.saleDate
                      ? new Date(
                          invoiceSale.saleDate
                        ).toLocaleDateString(
                          "en-PK",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : new Date().toLocaleDateString(
                          "en-PK"
                        )}

                  </strong>

                </div>

              </div>

              {/* PRODUCT */}

              <div className="invoice-product">

                <div>

                  <span>
                    Product
                  </span>

                  <strong>
                    {invoiceSale.product?.name ||
                      "Unknown Product"}
                  </strong>

                </div>

                <div>

                  <span>
                    SKU
                  </span>

                  <strong>
                    {invoiceSale.product?.sku ||
                      "-"}
                  </strong>

                </div>

                <div>

                  <span>
                    Quantity
                  </span>

                  <strong>
                    {invoiceSale.quantity}
                  </strong>

                </div>

                <div>

                  <span>
                    Unit Price
                  </span>

                  <strong>
                    {formatPKR(
                      invoiceSale.sellingPrice
                    )}
                  </strong>

                </div>

              </div>

              {/* TOTAL */}

              <div className="invoice-total">

                <span>
                  Total Amount
                </span>

                <strong>
                  {formatPKR(
                    invoiceSale.totalAmount
                  )}
                </strong>

              </div>

              {/* PROFIT */}

              <div className="invoice-total">

                <span>
                  Estimated Profit
                </span>

                <strong>
                  {formatPKR(
                    invoiceSale.profit
                  )}
                </strong>

              </div>

              {/* NOTES */}

              {invoiceSale.notes && (

                <div className="invoice-notes">

                  <span>
                    Notes
                  </span>

                  <p>
                    {invoiceSale.notes}
                  </p>

                </div>

              )}

              {/* FOOTER */}

              <div className="invoice-thank-you">

                Thank you for your
                business.

              </div>

            </div>

            {/* ==================================
                INVOICE ACTIONS
            ================================== */}

            <div className="invoice-modal-actions">

              {/* EDIT */}

              <button
                type="button"
                className="secondary-button"
                onClick={
                  handleEditInvoice
                }
                disabled={
                  finalizing
                }
              >
                Edit
              </button>

              {/* DOWNLOAD */}

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  downloadInvoice(
                    invoiceSale
                  )
                }
                disabled={
                  finalizing
                }
              >
                Download Invoice
              </button>

              {/* DONE */}

              <button
                type="button"
                className="primary-button"
                onClick={
                  handleDoneInvoice
                }
                disabled={
                  finalizing
                }
              >
                {finalizing
                  ? "Completing..."
                  : "Done"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Sales;