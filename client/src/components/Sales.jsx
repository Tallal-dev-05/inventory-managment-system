import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { formatPKR } from "../utils/currency";
import { api } from "../utils/api";

// ==========================================
// SHARED STYLES (MATCHING PRODUCTS & PURCHASES)
// ==========================================

const inputClass =
  "w-full min-w-0 h-[34px] px-[10px] border border-[#232839] rounded-[7px] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] transition-all focus:border-[#6865f5] focus:ring-[3px] focus:ring-[#6865f5]/15 placeholder:text-[#5f6882]";

const selectClass =
  "w-full min-w-0 h-[34px] px-[10px] border border-[#232839] rounded-[7px] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] cursor-pointer transition-all focus:border-[#6865f5] focus:ring-[3px] focus:ring-[#6865f5]/15";

const textareaClass =
  "w-full min-w-0 min-h-[65px] px-[10px] py-[9px] border border-[#232839] rounded-[7px] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] leading-[1.5] resize-y transition-all focus:border-[#6865f5] focus:ring-[3px] focus:ring-[#6865f5]/15 placeholder:text-[#5f6882]";

const labelClass = "text-[#aeb5ca] text-[9px] font-bold";

const primaryButton =
  "min-h-[34px] px-[13px] rounded-[7px] border border-[#6865f5] bg-[#6865f5] text-white text-[9px] font-bold cursor-pointer transition-all hover:bg-[#7773ff] hover:border-[#7773ff] hover:-translate-y-[1px] disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none";

const secondaryButton =
  "min-h-[34px] px-[13px] rounded-[7px] border border-[#2c3246] bg-[#1a1f2e] text-[#bbc2db] text-[9px] font-bold cursor-pointer transition-all hover:border-[#3a425a] hover:bg-[#22283a] disabled:opacity-55 disabled:cursor-not-allowed";

const closeButtonClass =
  "w-[27px] h-[27px] grid place-items-center shrink-0 p-0 border border-[#2b3144] rounded-[7px] bg-[#1a1f2e] text-[#9aa3bf] text-[18px] leading-none cursor-pointer hover:border-[#63343c] hover:bg-[#2a181e] hover:text-[#f46b78] transition-colors";

// ==========================================
// EMPTY FORM
// ==========================================

const getToday = () => new Date().toISOString().split("T")[0];

const getEmptyForm = () => ({
  productId: "",
  customerId: "",
  customerName: "",
  quantity: "",
  sellingPrice: "",
  amountPaid: "",
  saleDate: getToday(),
  notes: "",
});

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

  const safeText = (value, fallback = "-") => {
    const text = String(value || "").trim();
    return text || fallback;
  };

  const invoiceNumber = sale?._id
    ? sale._id.slice(-8).toUpperCase()
    : "DRAFT";

  const invoiceDate = sale?.saleDate
    ? new Date(sale.saleDate).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  const productName = safeText(sale?.product?.name, "Unknown Product");
  const productSku = safeText(sale?.product?.sku);
  const customerName = safeText(sale?.customerName, "Walk-in Customer");

  const quantity = Number(sale?.quantity || 0);
  const sellingPrice = Number(sale?.sellingPrice || 0);
  const previousBalance = Number(sale?.previousBalance || 0);
  const newSaleAmount = Number(sale?.totalAmount || 0);
  const amountPaid = Number(sale?.amountPaid || 0);

  const totalDue = previousBalance + newSaleAmount;
  const remainingBalance = Number(
    sale?.remainingBalance ?? totalDue - amountPaid
  );

  const colors = {
    page: [11, 14, 19],
    panel: [18, 22, 32],
    panelLight: [24, 29, 42],
    tableHeader: [16, 19, 27],
    border: [35, 40, 57],
    white: [241, 242, 247],
    text: [220, 224, 235],
    muted: [124, 134, 165],
    purple: [104, 101, 245],
    purpleLight: [151, 147, 255],
    green: [0, 201, 149],
    yellow: [245, 183, 25],
  };

  const setTextColor = (color) => {
    pdf.setTextColor(color[0], color[1], color[2]);
  };

  const setFillColor = (color) => {
    pdf.setFillColor(color[0], color[1], color[2]);
  };

  const setDrawColor = (color) => {
    pdf.setDrawColor(color[0], color[1], color[2]);
  };

  const drawRoundedPanel = (
    x,
    y,
    width,
    height,
    fillColor = colors.panel,
    radius = 3
  ) => {
    setFillColor(fillColor);
    setDrawColor(colors.border);
    pdf.roundedRect(x, y, width, height, radius, radius, "FD");
  };

  const drawLabel = (text, x, y, options = {}) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    setTextColor(colors.muted);
    pdf.text(String(text).toUpperCase(), x, y, options);
  };

  const drawValue = (
    text,
    x,
    y,
    options = {},
    color = colors.text,
    size = 10
  ) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(size);
    setTextColor(color);
    pdf.text(String(text), x, y, options);
  };

  // Background
  setFillColor(colors.page);
  pdf.rect(0, 0, 210, 297, "F");

  // Top accent
  setFillColor(colors.purple);
  pdf.rect(0, 0, 210, 3, "F");

  // Header Panel
  drawRoundedPanel(15, 13, 180, 31);

  // Logo mark
  setFillColor(colors.purple);
  pdf.roundedRect(22, 20, 17, 17, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setTextColor(colors.white);
  pdf.text("IM", 30.5, 30.5, { align: "center" });

  // Business name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(17);
  setTextColor(colors.white);
  pdf.text("INVENTORY", 45, 26);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setTextColor(colors.muted);
  pdf.text("Inventory Management System", 45, 32);

  // Invoice information
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  setTextColor(colors.purpleLight);
  pdf.text("SALES INVOICE", 188, 24, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setTextColor(colors.muted);
  pdf.text(`#${invoiceNumber}`, 188, 30, { align: "right" });
  pdf.text(invoiceDate, 188, 35, { align: "right" });

  // Customer & Invoice Details
  drawRoundedPanel(15, 50, 88, 29);
  drawRoundedPanel(107, 50, 88, 29);

  drawLabel("Bill To", 21, 58);
  const customerLines = pdf.splitTextToSize(customerName, 72);
  drawValue(customerLines.slice(0, 2), 21, 66, {}, colors.white, 11);

  drawLabel("Invoice Details", 113, 58);
  drawValue(`#${invoiceNumber}`, 113, 66, {}, colors.text, 9);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setTextColor(colors.muted);
  pdf.text(`Date: ${invoiceDate}`, 113, 72);

  // Product Table
  drawRoundedPanel(15, 85, 180, 43);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setTextColor(colors.white);
  pdf.text("Sale Details", 21, 94);

  setFillColor(colors.tableHeader);
  pdf.roundedRect(20, 99, 170, 10, 2, 2, "F");

  drawLabel("Product", 24, 105.5);
  drawLabel("SKU", 96, 105.5);
  drawLabel("Qty", 126, 105.5, { align: "center" });
  drawLabel("Unit Price", 153, 105.5, { align: "right" });
  drawLabel("Total", 186, 105.5, { align: "right" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  setTextColor(colors.text);

  const productLines = pdf.splitTextToSize(productName, 61);
  pdf.text(productLines.slice(0, 1), 24, 118);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setTextColor(colors.muted);
  pdf.text(productSku, 96, 118);

  pdf.setFont("helvetica", "bold");
  setTextColor(colors.text);
  pdf.text(String(quantity), 126, 118, { align: "center" });
  pdf.text(money(sellingPrice), 153, 118, { align: "right" });

  setTextColor(colors.purpleLight);
  pdf.text(money(newSaleAmount), 186, 118, { align: "right" });

  // Payment Summary
  drawRoundedPanel(15, 134, 180, 70);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setTextColor(colors.white);
  pdf.text("Payment Summary", 21, 144);

  setDrawColor(colors.border);
  pdf.setLineWidth(0.3);
  pdf.line(21, 149, 189, 149);

  const summaryRows = [
    { label: "Previous balance", value: previousBalance, color: colors.text },
    { label: "New sale", value: newSaleAmount, color: colors.text },
    { label: "Total amount due", value: totalDue, color: colors.purpleLight },
    { label: "Paid now", value: amountPaid, color: colors.green },
  ];

  let rowY = 158;
  summaryRows.forEach((row) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    setTextColor(colors.muted);
    pdf.text(row.label, 24, rowY);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    setTextColor(row.color);
    pdf.text(money(row.value), 186, rowY, { align: "right" });
    rowY += 9;
  });

  // Remaining Balance Box
  setFillColor([16, 37, 31]);
  setDrawColor([7, 88, 68]);
  pdf.roundedRect(21, 187, 168, 11, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  setTextColor(colors.green);
  pdf.text("Remaining Balance", 26, 194);

  pdf.setFontSize(10);
  pdf.text(money(remainingBalance), 184, 194, { align: "right" });

  // Status Badge
  const isPaid = remainingBalance <= 0;
  if (isPaid) {
    setFillColor([7, 55, 45]);
    setDrawColor([7, 88, 68]);
    setTextColor(colors.green);
  } else {
    setFillColor([48, 36, 9]);
    setDrawColor([112, 70, 6]);
    setTextColor(colors.yellow);
  }

  pdf.roundedRect(15, 210, 38, 9, 4, 4, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(isPaid ? "PAID" : "PAYMENT DUE", 34, 215.7, { align: "center" });

  // Notes
  if (sale?.notes) {
    drawRoundedPanel(15, 225, 180, 30);
    drawLabel("Notes", 21, 233);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    setTextColor(colors.muted);
    const notes = pdf.splitTextToSize(safeText(sale.notes), 164);
    pdf.text(notes.slice(0, 3), 21, 240);
  }

  // Footer
  const footerY = sale?.notes ? 270 : 250;
  setDrawColor(colors.border);
  pdf.line(15, footerY, 195, footerY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setTextColor(colors.purpleLight);
  pdf.text("Thank you for your business.", 105, footerY + 8, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  setTextColor(colors.muted);
  pdf.text("Generated by Inventory Management System", 105, footerY + 14, { align: "center" });
  pdf.text(`Invoice #${invoiceNumber}`, 15, 289);
  pdf.text("Page 1 of 1", 195, 289, { align: "right" });

  pdf.save(`invoice-${invoiceNumber}.pdf`);
}

// ==========================================
// SALES COMPONENT
// ==========================================

export default function Sales() {
  const navigate = useNavigate();

  // Data state
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerAccount, setCustomerAccount] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [paymentAmount, setPaymentAmount] = useState("");

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState(getEmptyForm);
  const [customerBalance, setCustomerBalance] = useState(0);
  const [invoiceSale, setInvoiceSale] = useState(null);
  const [invoiceViewOnly, setInvoiceViewOnly] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState(null);

  // ==========================================
  // FETCH DATA
  // ==========================================

  async function getProducts() {
    try {
      const response = await fetch(api("/api/products"), {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get products");
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function getSales() {
    try {
      const response = await fetch(api("/api/sales"), {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get sales");
      setSales(data.sales || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function getCustomers() {
    try {
      const response = await fetch(api("/api/customers"), {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get customers");
      setCustomers(data.customers || []);
      return data.customers || [];
    } catch (err) {
      setError(err.message);
    }
  }

  async function openCustomerAccount(customerId) {
    try {
      const response = await fetch(api(`/api/customers/${customerId}/transactions`), {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get customer account");
      setCustomerAccount(data);
      setPaymentAmount("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function createCustomer(event) {
    event.preventDefault();
    try {
      const response = await fetch(api("/api/customers"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create customer");
      await getCustomers();
      setFormData((previous) => ({
        ...previous,
        customerId: data.customer._id,
        customerName: data.customer.name,
      }));
      setCustomerBalance(Number(data.customer.balance || 0));
      setNewCustomer({ name: "", phone: "" });
      setShowNewCustomer(false);
      setSuccess("Customer created and selected.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function receivePayment(event) {
    event.preventDefault();
    if (!customerAccount) return;
    try {
      const response = await fetch(
        api(`/api/customers/${customerAccount.customer._id}/payment`),
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: Number(paymentAmount) }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to record payment");

      setCustomers((previous) =>
        previous.map((c) => (c._id === data.customer._id ? data.customer : c))
      );
      setCustomerAccount((previous) =>
        previous && {
          customer: data.customer,
          transactions: [data.transaction, ...previous.transactions],
        }
      );
      setCustomerBalance((previous) =>
        customerAccount.customer._id === formData.customerId
          ? Number(data.customer.balance || 0)
          : previous
      );
      setPaymentAmount("");
      await getCustomers();
      setSuccess("Payment recorded successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        await Promise.all([getProducts(), getSales(), getCustomers()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  async function handleCustomerChange(event) {
    const value = event.target.value;
    const customer = customers.find((item) => item._id === value);

    setFormData((prev) => ({
      ...prev,
      customerId: value,
      customerName: customer?.name || "",
    }));
    setCustomerBalance(Number(customer?.balance || 0));
    setError("");
    setSuccess("");

    if (!value) return;

    try {
      const response = await fetch(api(`/api/customers/${value}`), {
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get customer");
      setFormData((prev) => ({
        ...prev,
        customerId: data.customer._id,
        customerName: data.customer.name,
      }));
      setCustomerBalance(Number(data.customer.balance || 0));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  }

  function handleProductChange(event) {
    const productId = event.target.value;
    const selected = products.find((p) => p._id === productId);

    setFormData((prev) => ({
      ...prev,
      productId,
      sellingPrice: selected ? selected.sellingPrice : "",
    }));
    setError("");
    setSuccess("");
  }

  // Derived calculations
  const selectedProduct = products.find((p) => p._id === formData.productId);
  const totalAmount =
    Number(formData.quantity || 0) * Number(formData.sellingPrice || 0);
  const totalDue = Number(customerBalance || 0) + totalAmount;
  const paidAmount = Number(formData.amountPaid || 0);
  const remainingBalance = Math.max(0, totalDue - paidAmount);
  const estimatedProfit =
    Number(formData.quantity || 0) *
    (Number(formData.sellingPrice || 0) - Number(selectedProduct?.costPrice || 0));

  const totalSalesAmount = sales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount || 0),
    0
  );
  const totalCashReceived = sales.reduce(
    (sum, sale) => sum + Number(sale.amountPaid || 0),
    0
  );
  const totalOutstanding = customers.reduce(
    (sum, customer) => sum + Number(customer.balance || 0),
    0
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.productId) {
      setError("Please select a product");
      return;
    }

    if (!formData.quantity) {
      setError("Please enter quantity");
      return;
    }

    if (
      !Number.isInteger(Number(formData.quantity)) ||
      Number(formData.quantity) <= 0
    ) {
      setError("Quantity must be a positive whole number");
      return;
    }

    if (
      selectedProduct &&
      Number(formData.quantity) > Number(selectedProduct.quantity)
    ) {
      setError(
        `Insufficient stock. Available stock: ${selectedProduct.quantity}`
      );
      return;
    }

    if (formData.sellingPrice === "" || Number(formData.sellingPrice) < 0) {
      setError("Please enter a valid selling price");
      return;
    }

    const customerName = formData.customerName.trim();
    const isWalkIn =
      !customerName || customerName.toLowerCase() === "walk-in customer";

    const payment =
      formData.amountPaid === ""
        ? isWalkIn
          ? totalAmount
          : 0
        : Number(formData.amountPaid);

    if (Number.isNaN(payment) || payment < 0) {
      setError("Please enter a valid paid amount");
      return;
    }

    if (isWalkIn && payment < totalAmount) {
      setError(
        "Enter a customer name if you want to give credit. Walk-in Customer must pay the full sale amount."
      );
      return;
    }

    const calculatedTotalDue = Number(customerBalance || 0) + totalAmount;
    if (payment > calculatedTotalDue) {
      setError(
        `Paid amount cannot exceed total amount due of ${formatPKR(
          calculatedTotalDue
        )}`
      );
      return;
    }

    try {
      setSaving(true);
      const isEditing = Boolean(editingSaleId);
      const url = isEditing
        ? api(`/api/sales/${editingSaleId}`)
        : api("/api/sales");
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: formData.productId,
          customerId: formData.customerId || undefined,
          customerName: customerName,
          quantity: Number(formData.quantity),
          sellingPrice: Number(formData.sellingPrice),
          amountPaid: payment,
          saleDate: formData.saleDate || undefined,
          notes: formData.notes.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || (isEditing ? "Failed to update sale" : "Failed to create sale")
        );
      }

      const updatedSale = data.sale;
      if (!updatedSale) {
        throw new Error("Sale information was not returned by the server.");
      }

      setFormData(getEmptyForm());
      setShowForm(false);
      setEditingSaleId(null);
      setCustomerBalance(0);

      setInvoiceSale(updatedSale);
      setInvoiceViewOnly(false);

      await getProducts();
      setSuccess(
        isEditing
          ? "Sale updated. Please review the invoice."
          : "Sale saved. Please review the invoice."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEditInvoice() {
    if (!invoiceSale) return;
    const productId = invoiceSale.product?._id || invoiceSale.product;

    let saleDate = "";
    if (invoiceSale.saleDate) {
      const date = new Date(invoiceSale.saleDate);
      if (!Number.isNaN(date.getTime())) {
        saleDate = date.toISOString().split("T")[0];
      }
    }

    setFormData({
      productId: productId || "",
      customerId: invoiceSale.customer?._id || invoiceSale.customer || "",
      customerName:
        invoiceSale.customerName === "Walk-in Customer"
          ? ""
          : invoiceSale.customerName || "",
      quantity: invoiceSale.quantity || "",
      sellingPrice: invoiceSale.sellingPrice ?? "",
      amountPaid: invoiceSale.amountPaid ?? "",
      saleDate,
      notes: invoiceSale.notes || "",
    });

    setEditingSaleId(invoiceSale._id);
    setInvoiceSale(null);
    setShowForm(true);
    setError("");
    setSuccess("");
    setCustomerBalance(Number(invoiceSale.customer?.balance || 0));
  }

  async function handleDoneInvoice() {
    if (!invoiceSale?._id) {
      setError("Invalid sale. Cannot finalize.");
      return;
    }

    try {
      setFinalizing(true);
      setError("");

      const response = await fetch(
        api(`/api/sales/${invoiceSale._id}/finalize`),
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to finalize sale");
      }

      setInvoiceSale(null);
      await Promise.all([getProducts(), getSales(), getCustomers()]);
      setSuccess("Sale completed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setFinalizing(false);
    }
  }

  function cancelForm() {
    setShowForm(false);
    setFormData(getEmptyForm());
    setEditingSaleId(null);
    setCustomerBalance(0);
    setError("");
    setSuccess("");
  }

  function closeInvoice() {
    setInvoiceSale(null);
    setInvoiceViewOnly(false);
  }

  function openNewSale() {
    setShowForm(true);
    setEditingSaleId(null);
    setFormData(getEmptyForm());
    setCustomerBalance(0);
    setError("");
    setSuccess("");
  }

  // ==========================================
  // LOADING SCREEN (MATCHING PURCHASES & PRODUCTS)
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0b0e13] text-[#e8eaf2] flex flex-col items-center justify-center gap-3 font-sans text-[10px]">
        <div className="h-8 w-8 rounded-full border-[3px] border-[#232839] border-t-[#6865f5] animate-spin" />
        <p className="text-[#7c86a5] font-semibold">Loading sales...</p>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================

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
            Sales
          </h1>

          <p className="m-0 text-[#7c86a5] text-[10px] leading-[1.5]">
            Record products sold to customers
          </p>
        </div>

        {!showForm && (
          <button className={primaryButton} onClick={openNewSale}>
            + Add Sale
          </button>
        )}
      </div>

      {/* ==========================================
          FEEDBACK ALERTS
      ========================================== */}
      {success && (
        <div className="mb-[15px] px-[12px] py-[10px] border border-[#075844] rounded-[7px] bg-[#07372d] text-[#00c995] text-[9px] leading-[1.5]">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-[15px] px-[12px] py-[10px] border border-[#64323c] rounded-[7px] bg-[#28171d] text-[#ff8b96] text-[9px] leading-[1.5]">
          {error}
        </div>
      )}

      {/* ==========================================
          CASH FLOW METRICS CARDS
      ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[10px] mb-[18px]">
        <div className="relative min-w-0 p-[14px] rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">
          <span className="block text-[#7c86a5] text-[7px] font-extrabold tracking-wider uppercase">
            TOTAL SALES
          </span>
          <strong className="block mt-2 text-[#f1f2f6] text-[18px] font-extrabold leading-none">
            {formatPKR(totalSalesAmount)}
          </strong>
          <span className="block mt-1.5 text-[#7c86a5] text-[8px]">
            Cumulative sales revenue
          </span>
        </div>

        <div className="relative min-w-0 p-[14px] rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">
          <span className="block text-[#7c86a5] text-[7px] font-extrabold tracking-wider uppercase">
            CASH RECEIVED
          </span>
          <strong className="block mt-2 text-[#00c995] text-[18px] font-extrabold leading-none">
            {formatPKR(totalCashReceived)}
          </strong>
          <span className="block mt-1.5 text-[#7c86a5] text-[8px]">
            Actual payments collected
          </span>
        </div>

        <div className="relative min-w-0 p-[14px] rounded-[10px] border border-[#232839] bg-[#121620] hover:-translate-y-0.5 hover:border-[#343b50] transition">
          <span className="block text-[#7c86a5] text-[7px] font-extrabold tracking-wider uppercase">
            OUTSTANDING CREDIT
          </span>
          <strong className="block mt-2 text-[#f5b719] text-[18px] font-extrabold leading-none">
            {formatPKR(totalOutstanding)}
          </strong>
          <span className="block mt-1.5 text-[#7c86a5] text-[8px]">
            Customer balances pending
          </span>
        </div>
      </div>

      {/* ==========================================
          ADD / EDIT SALE FORM
      ========================================== */}
      {showForm && (
        <div className="mb-[18px] p-[17px] border border-[#232839] rounded-[10px] bg-[#121620]">
          <div className="flex items-start justify-between gap-[16px] mb-[15px] pb-[12px] border-b border-[#232839]">
            <div>
              <h2 className="m-0 text-[#f0f1f6] text-[14px] leading-[1.3] font-semibold">
                {editingSaleId ? "Edit Sale" : "Add Sale"}
              </h2>
              <p className="m-0 mt-[2px] text-[9px] text-[#7c86a5]">
                Enter sale details, update inventory and track customer balances.
              </p>
            </div>

            <button
              type="button"
              onClick={cancelForm}
              disabled={saving}
              aria-label="Close"
              className={closeButtonClass}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[13px]">
              {/* Product */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Product *</label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleProductChange}
                  required
                  className={selectClass}
                >
                  <option value="">Select product</option>
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

              {/* Customer */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Customer</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomer(true)}
                    className="p-0 border-0 bg-transparent text-[#8d89ff] text-[8px] font-bold cursor-pointer hover:text-[#aaa8ff]"
                  >
                    + New customer
                  </button>
                </div>
                <select
                  value={formData.customerId}
                  onChange={handleCustomerChange}
                  className={selectClass}
                >
                  <option value="" className="bg-[#121620] text-[#e8eaf2]">
                    Walk-in Customer
                  </option>
                  {customers.map((customer) => (
                    <option
                      key={customer._id}
                      value={customer._id}
                      className="bg-[#121620] text-[#e8eaf2]"
                    >
                      {customer.name} — {formatPKR(customer.balance)} due
                    </option>
                  ))}
                </select>
              </div>

              {/* Previous Balance */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Previous Balance (PKR)</label>
                <input
                  type="text"
                  value={formatPKR(customerBalance)}
                  readOnly
                  className={`${inputClass} bg-[#181c28] border-[#2c3246] text-[#c4cada] font-bold cursor-default`}
                />
              </div>

              {/* Available Stock */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Available Stock</label>
                <input
                  type="text"
                  value={selectedProduct ? selectedProduct.quantity : "-"}
                  readOnly
                  className={`${inputClass} bg-[#181c28] border-[#2c3246] text-[#c4cada] font-bold cursor-default`}
                />
              </div>

              {/* Quantity */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Quantity *</label>
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

              {/* Selling Price */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Selling Price (PKR) *</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  placeholder="Enter selling price"
                  min="0"
                  step="0.01"
                  required
                  className={inputClass}
                />
              </div>

              {/* New Sale Total */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>New Sale Total (PKR)</label>
                <input
                  type="text"
                  value={formatPKR(totalAmount)}
                  readOnly
                  className={`${inputClass} bg-[#181c28] text-[#e8eaf2] font-semibold cursor-default`}
                />
              </div>

              {/* Total Due */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Total Due (PKR)</label>
                <input
                  type="text"
                  value={formatPKR(totalDue)}
                  readOnly
                  className={`${inputClass} bg-[#181c28] text-[#9592ff] font-bold cursor-default`}
                />
              </div>

              {/* Paid Now */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Paid Now (PKR)</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  placeholder={
                    formData.customerName ? "Amount customer pays" : "Full amount"
                  }
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </div>

              {/* Remaining Balance */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Remaining Balance (PKR)</label>
                <input
                  type="text"
                  value={formatPKR(remainingBalance)}
                  readOnly
                  className={`${inputClass} bg-[#181c28] ${
                    remainingBalance > 0 ? "text-[#f5b719]" : "text-[#00c995]"
                  } font-bold cursor-default`}
                />
              </div>

              {/* Estimated Profit */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Estimated Profit (PKR)</label>
                <input
                  type="text"
                  value={formatPKR(estimatedProfit)}
                  readOnly
                  className={`${inputClass} bg-[#181c28] text-[#00c995] font-bold cursor-default`}
                />
              </div>

              {/* Sale Date */}
              <div className="min-w-0 flex flex-col gap-[5px]">
                <label className={labelClass}>Sale Date</label>
                <input
                  type="date"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleChange}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>

              {/* Notes */}
              <div className="min-w-0 flex flex-col gap-[5px] md:col-span-2 lg:col-span-3">
                <label className={labelClass}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Optional notes"
                  rows="3"
                  className={textareaClass}
                />
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-[1px] mt-4 overflow-hidden border border-[#232839] rounded-[9px] bg-[#232839]">
              <div className="min-w-0 p-2.5 bg-[#10141d]">
                <span className="block text-[#7c86a5] text-[7px] font-extrabold uppercase">
                  Previous Balance
                </span>
                <strong className="block mt-1 text-[#dfe2ec] text-[10px]">
                  {formatPKR(customerBalance)}
                </strong>
              </div>
              <div className="min-w-0 p-2.5 bg-[#10141d]">
                <span className="block text-[#7c86a5] text-[7px] font-extrabold uppercase">
                  New Sale
                </span>
                <strong className="block mt-1 text-[#dfe2ec] text-[10px]">
                  {formatPKR(totalAmount)}
                </strong>
              </div>
              <div className="min-w-0 p-2.5 bg-[#10141d]">
                <span className="block text-[#7c86a5] text-[7px] font-extrabold uppercase">
                  Total Due
                </span>
                <strong className="block mt-1 text-[#9592ff] text-[10px] font-bold">
                  {formatPKR(totalDue)}
                </strong>
              </div>
              <div className="min-w-0 p-2.5 bg-[#10141d]">
                <span className="block text-[#7c86a5] text-[7px] font-extrabold uppercase">
                  Paid Now
                </span>
                <strong className="block mt-1 text-[#00c995] text-[10px] font-bold">
                  {formatPKR(paidAmount)}
                </strong>
              </div>
              <div className="col-span-2 sm:col-span-1 min-w-0 p-2.5 bg-[#10251f]">
                <span className="block text-[#7c86a5] text-[7px] font-extrabold uppercase">
                  Remaining
                </span>
                <strong
                  className={`block mt-1 text-[10px] font-bold ${
                    remainingBalance > 0 ? "text-[#f5b719]" : "text-[#00c995]"
                  }`}
                >
                  {formatPKR(remainingBalance)}
                </strong>
              </div>
            </div>

            {/* Buttons */}
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

      {/* ==========================================
          SALES HISTORY TABLE (MATCHING PURCHASES)
      ========================================== */}
      <div className="w-full min-w-0 overflow-hidden border border-[#232839] rounded-[10px] bg-[#121620] mb-[18px]">
        <div className="min-h-[54px] flex items-center justify-between gap-[15px] px-[15px] py-[12px] border-b border-[#232839]">
          <h2 className="m-0 text-[#f0f1f6] text-[13px] font-semibold">
            Sales History
          </h2>
          <span className="shrink-0 px-[8px] py-[4px] rounded-full bg-[#202441] text-[#9592ff] text-[8px] font-bold">
            {sales.length} sale{sales.length !== 1 ? "s" : ""}
          </span>
        </div>

        {sales.length === 0 ? (
          <div className="min-h-[180px] flex flex-col items-center justify-center px-[18px] py-[30px] text-center text-[#7c86a5]">
            <h3 className="m-0 mb-[5px] text-[#e8eaf2] text-[12px] font-semibold">
              No sales found
            </h3>
            <p className="m-0 text-[9px]">
              Click "Add Sale" to record your first sale.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[1000px] table-fixed border-spacing-0 border-collapse">
              <thead>
                <tr>
                  <th className="w-[16%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Product
                  </th>
                  <th className="w-[8%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    SKU
                  </th>
                  <th className="w-[12%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Customer
                  </th>
                  <th className="w-[6%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-center text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Quantity
                  </th>
                  <th className="w-[10%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Selling Price (PKR)
                  </th>
                  <th className="w-[10%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Total (PKR)
                  </th>
                  <th className="w-[9%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Paid (PKR)
                  </th>
                  <th className="w-[9%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Remaining
                  </th>
                  <th className="w-[9%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Profit
                  </th>
                  <th className="w-[9%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Date
                  </th>
                  <th className="w-[11%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale._id}
                    className="bg-transparent hover:bg-[#171b27] transition-colors"
                  >
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#dfe2ec] text-[9px] font-bold whitespace-nowrap text-ellipsis">
                      {sale.product?.name || "Unknown Product"}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#7e89a8] text-[9px] font-mono whitespace-nowrap text-ellipsis">
                      {sale.product?.sku || "-"}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap text-ellipsis">
                      {sale.customerName || "Walk-in Customer"}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#e1e4ed] text-[9px] font-bold text-center whitespace-nowrap">
                      {sale.quantity}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#c0c7db] text-[9px] whitespace-nowrap text-ellipsis">
                      {formatPKR(sale.sellingPrice)}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#00c995] text-[9px] font-bold whitespace-nowrap text-ellipsis">
                      {formatPKR(sale.totalAmount)}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#c0c7db] text-[9px] whitespace-nowrap text-ellipsis">
                      {formatPKR(sale.amountPaid)}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[9px] whitespace-nowrap text-ellipsis">
                      {Number(sale.remainingBalance) > 0 ? (
                        <span className="text-[#f5b719] font-bold">
                          {formatPKR(sale.remainingBalance)}
                        </span>
                      ) : (
                        <span className="text-[#00c995] font-bold">Paid</span>
                      )}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#9592ff] text-[9px] font-bold whitespace-nowrap text-ellipsis">
                      {formatPKR(sale.profit)}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#adb5ca] text-[9px] whitespace-nowrap">
                      {sale.saleDate
                        ? new Date(sale.saleDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden">
                      <div className="flex items-center gap-[5px]">
                        <button
                          type="button"
                          className="min-h-[26px] px-[7px] border border-[#4945a0] rounded-[6px] bg-transparent text-[#9592ff] text-[7px] font-bold cursor-pointer hover:bg-[#202441] transition-colors"
                          onClick={() => {
                            setInvoiceSale(sale);
                            setInvoiceViewOnly(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="min-h-[26px] px-[7px] border border-[#075844] rounded-[6px] bg-[#07372d] text-[#00c995] text-[7px] font-bold cursor-pointer hover:bg-[#00c995] hover:text-[#071912] transition-colors"
                          onClick={() => downloadInvoice(sale)}
                        >
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          CUSTOMERS TABLE
      ========================================== */}
      <div className="w-full min-w-0 overflow-hidden border border-[#232839] rounded-[10px] bg-[#121620]">
        <div className="min-h-[54px] flex items-center justify-between gap-[15px] px-[15px] py-[12px] border-b border-[#232839]">
          <div>
            <h2 className="m-0 text-[#f0f1f6] text-[13px] font-semibold">
              Customer Accounts
            </h2>
            <p className="m-0 mt-[2px] text-[8px] text-[#7c86a5]">
              Manage balances and customer payment ledgers
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 px-[8px] py-[4px] rounded-full bg-[#202441] text-[#9592ff] text-[8px] font-bold">
              {customers.length} customer{customers.length !== 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => setShowNewCustomer(true)}
              className="min-h-[26px] px-[8px] border border-[#2c3246] rounded-[6px] bg-[#1a1f2e] text-[#bbc2db] text-[8px] font-bold cursor-pointer hover:border-[#3a425a] hover:bg-[#22283a] transition-colors"
            >
              + New Customer
            </button>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="min-h-[140px] flex flex-col items-center justify-center px-[18px] py-[25px] text-center text-[#7c86a5]">
            <h3 className="m-0 mb-[5px] text-[#e8eaf2] text-[12px] font-semibold">
              No customers registered
            </h3>
            <p className="m-0 text-[9px]">
              Create a customer to track credit accounts and transaction history.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto overflow-y-hidden">
            <table className="w-full min-w-[700px] table-fixed border-spacing-0 border-collapse">
              <thead>
                <tr>
                  <th className="w-[35%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Customer Name
                  </th>
                  <th className="w-[25%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Phone
                  </th>
                  <th className="w-[25%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Current Outstanding
                  </th>
                  <th className="w-[15%] h-[36px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="bg-transparent hover:bg-[#171b27] transition-colors"
                  >
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#dfe2ec] text-[9px] font-bold whitespace-nowrap text-ellipsis">
                      {customer.name}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[#7e89a8] text-[9px] font-mono whitespace-nowrap text-ellipsis">
                      {customer.phone || "-"}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden text-[9px] font-bold whitespace-nowrap text-ellipsis">
                      {Number(customer.balance) > 0 ? (
                        <span className="text-[#f5b719]">
                          {formatPKR(customer.balance)}
                        </span>
                      ) : (
                        <span className="text-[#00c995]">PKR 0.00</span>
                      )}
                    </td>
                    <td className="h-[50px] px-[10px] border-b border-[#202637] overflow-hidden">
                      <button
                        type="button"
                        className="min-h-[26px] px-[8px] border border-[#4945a0] rounded-[6px] bg-transparent text-[#9592ff] text-[7px] font-bold cursor-pointer hover:bg-[#202441] transition-colors"
                        onClick={() => openCustomerAccount(customer._id)}
                      >
                        View Ledger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          INVOICE MODAL
      ========================================== */}
      {invoiceSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-[690px] max-h-[calc(100vh-36px)] overflow-y-auto border border-[#2c3246] rounded-[12px] bg-[#121620] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-3.5 border-b border-[#232839] bg-[#121620]">
              <div>
                <h2 className="m-0 text-[#f1f2f6] text-[14px] font-semibold">
                  Review Invoice
                </h2>
                <p className="m-0 mt-0.5 text-[#7c86a5] text-[9px]">
                  Check the invoice details before completing the sale.
                </p>
              </div>

              <button
                type="button"
                className={closeButtonClass}
                onClick={closeInvoice}
                disabled={finalizing}
              >
                ×
              </button>
            </div>

            {/* Invoice Content */}
            <div className="m-4 p-4 border border-[#232839] rounded-[9px] bg-[#0f131b]">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#232839]">
                <div>
                  <h1 className="m-0 text-[#f1f2f6] text-[16px] font-bold">
                    INVENTORY
                  </h1>
                  <p className="m-0 text-[#7c86a5] text-[9px]">Sales Invoice</p>
                </div>

                <div className="flex flex-col items-end gap-0.5 text-right">
                  <strong className="text-[#9592ff] text-[10px] font-bold">
                    INVOICE
                  </strong>
                  <span className="text-[#7c86a5] text-[9px] font-mono">
                    #
                    {invoiceSale._id
                      ? invoiceSale._id.slice(-8).toUpperCase()
                      : "DRAFT"}
                  </span>
                </div>
              </div>

              {/* Bill to & Date */}
              <div className="flex justify-between gap-6 py-3">
                <div>
                  <span className="block text-[#7c86a5] text-[8px] font-bold uppercase">
                    Bill To
                  </span>
                  <strong className="text-[#dfe2ec] text-[11px]">
                    {invoiceSale.customerName || "Walk-in Customer"}
                  </strong>
                </div>

                <div className="text-right">
                  <span className="block text-[#7c86a5] text-[8px] font-bold uppercase">
                    Invoice Date
                  </span>
                  <strong className="text-[#dfe2ec] text-[10px]">
                    {invoiceSale.saleDate
                      ? new Date(invoiceSale.saleDate).toLocaleDateString("en-PK", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : new Date().toLocaleDateString("en-PK")}
                  </strong>
                </div>
              </div>

              {/* Product row */}
              <div className="grid grid-cols-[minmax(130px,2fr)_minmax(70px,1fr)_minmax(60px,0.7fr)_minmax(100px,1.3fr)] gap-2 p-3 border border-[#232839] rounded-[8px] bg-[#151925]">
                <div>
                  <span className="block text-[#7c86a5] text-[7px] font-bold uppercase">
                    Product
                  </span>
                  <strong className="text-[#dfe2ec] text-[10px]">
                    {invoiceSale.product?.name || "Unknown Product"}
                  </strong>
                </div>

                <div>
                  <span className="block text-[#7c86a5] text-[7px] font-bold uppercase">
                    SKU
                  </span>
                  <strong className="text-[#7e89a8] text-[9px] font-mono">
                    {invoiceSale.product?.sku || "-"}
                  </strong>
                </div>

                <div>
                  <span className="block text-[#7c86a5] text-[7px] font-bold uppercase">
                    Quantity
                  </span>
                  <strong className="text-[#dfe2ec] text-[10px]">
                    {invoiceSale.quantity}
                  </strong>
                </div>

                <div className="text-right">
                  <span className="block text-[#7c86a5] text-[7px] font-bold uppercase">
                    Unit Price
                  </span>
                  <strong className="text-[#00c995] text-[10px]">
                    {formatPKR(invoiceSale.sellingPrice)}
                  </strong>
                </div>
              </div>

              {/* Cash Flow in invoice */}
              <div className="grid grid-cols-2 gap-[1px] mt-3 overflow-hidden border border-[#232839] rounded-[8px] bg-[#232839]">
                <div className="p-2 bg-[#121620]">
                  <span className="block text-[#7c86a5] text-[7px] font-bold uppercase">
                    Previous Balance
                  </span>
                  <strong className="text-[#dfe2ec] text-[9px]">
                    {formatPKR(invoiceSale.previousBalance)}
                  </strong>
                </div>

                <div className="p-2 bg-[#121620] text-right">
                  <span className="block text-[#7c86a5] text-[7px] font-bold uppercase">
                    New Sale
                  </span>
                  <strong className="text-[#dfe2ec] text-[9px]">
                    {formatPKR(invoiceSale.totalAmount)}
                  </strong>
                </div>

                <div className="p-2 bg-[#121620]">
                  <span className="block text-[#7c86a5] text-[7px] font-bold uppercase">
                    Total Due
                  </span>
                  <strong className="text-[#9592ff] text-[9px] font-bold">
                    {formatPKR(
                      Number(invoiceSale.previousBalance || 0) +
                        Number(invoiceSale.totalAmount || 0)
                    )}
                  </strong>
                </div>

                <div className="p-2 bg-[#121620] text-right">
                  <span className="block text-[#7c86a5] text-[7px] font-bold uppercase">
                    Paid Now
                  </span>
                  <strong className="text-[#00c995] text-[9px] font-bold">
                    {formatPKR(invoiceSale.amountPaid)}
                  </strong>
                </div>

                <div className="col-span-full flex items-center justify-between p-2.5 bg-[#10251f]">
                  <span className="text-[#7c86a5] text-[8px] font-bold uppercase">
                    Remaining Balance
                  </span>
                  <strong className="text-[#00c995] text-[10px] font-bold">
                    {formatPKR(invoiceSale.remainingBalance)}
                  </strong>
                </div>
              </div>

              {invoiceSale.notes && (
                <div className="pt-3">
                  <span className="block text-[#7c86a5] text-[8px] font-bold uppercase">
                    Notes
                  </span>
                  <p className="m-0 mt-0.5 text-[#adb5ca] text-[9px]">
                    {invoiceSale.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 text-[#7c86a5] text-[8px] text-center">
                Thank you for your business.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 z-10 flex justify-end gap-2 p-3 border-t border-[#232839] bg-[#121620]">
              {invoiceViewOnly ? (
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => downloadInvoice(invoiceSale)}
                  disabled={finalizing}
                >
                  Download Invoice
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={secondaryButton}
                    onClick={handleEditInvoice}
                    disabled={finalizing}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={secondaryButton}
                    onClick={() => downloadInvoice(invoiceSale)}
                    disabled={finalizing}
                  >
                    Download Invoice
                  </button>
                  <button
                    type="button"
                    className={primaryButton}
                    onClick={handleDoneInvoice}
                    disabled={finalizing}
                  >
                    {finalizing ? "Completing..." : "Confirm"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          NEW CUSTOMER MODAL
      ========================================== */}
      {showNewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-sm">
          <form
            className="w-full max-w-[470px] border border-[#2c3246] rounded-[12px] bg-[#121620] overflow-hidden shadow-2xl"
            onSubmit={createCustomer}
          >
            <div className="flex items-start justify-between gap-4 p-3.5 border-b border-[#232839] bg-[#121620]">
              <div>
                <h2 className="m-0 text-[#f1f2f6] text-[14px] font-semibold">
                  New Customer
                </h2>
                <p className="m-0 mt-0.5 text-[#7c86a5] text-[8px]">
                  Create and select a customer for this sale.
                </p>
              </div>
              <button
                type="button"
                className={closeButtonClass}
                onClick={() => setShowNewCustomer(false)}
              >
                ×
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Customer Name *</label>
                <input
                  required
                  value={newCustomer.name}
                  onChange={(event) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. John Doe"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>Phone</label>
                <input
                  value={newCustomer.phone}
                  onChange={(event) =>
                    setNewCustomer((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="e.g. 03001234567"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-3 border-t border-[#232839] bg-[#121620]">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setShowNewCustomer(false)}
              >
                Cancel
              </button>
              <button className={primaryButton} type="submit">
                Create Customer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==========================================
          CUSTOMER ACCOUNT / LEDGER MODAL
      ========================================== */}
      {customerAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-[820px] border border-[#2c3246] rounded-[12px] bg-[#121620] overflow-hidden shadow-2xl">
            <div className="flex items-start justify-between gap-4 p-3.5 border-b border-[#232839] bg-[#121620]">
              <div>
                <h2 className="m-0 text-[#f1f2f6] text-[14px] font-semibold">
                  {customerAccount.customer.name}
                </h2>
                <p className="m-0 mt-0.5 text-[#7c86a5] text-[9px]">
                  {customerAccount.customer.phone || "No phone number"} · Outstanding Balance:{" "}
                  <span className="text-[#f5b719] font-bold">
                    {formatPKR(customerAccount.customer.balance)}
                  </span>
                </p>
              </div>
              <button
                type="button"
                className={closeButtonClass}
                onClick={() => setCustomerAccount(null)}
              >
                ×
              </button>
            </div>

            <form
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-2.5 p-3.5 border-b border-[#232839] bg-[#151925]"
              onSubmit={receivePayment}
            >
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Receive Payment (PKR)</label>
                <input
                  required
                  min="0.01"
                  max={customerAccount.customer.balance}
                  step="0.01"
                  type="number"
                  placeholder="Enter amount to pay"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  className={inputClass}
                />
              </div>
              <button type="submit" className={primaryButton}>
                Record Payment
              </button>
            </form>

            <div className="p-3.5">
              <div className="w-full max-w-full overflow-x-auto overflow-y-hidden border border-[#232839] rounded-[8px]">
                <table className="w-full min-w-[600px] table-fixed border-spacing-0 border-collapse">
                  <thead>
                    <tr>
                      <th className="w-[20%] h-[34px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px]">
                        Date
                      </th>
                      <th className="w-[15%] h-[34px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px]">
                        Type
                      </th>
                      <th className="w-[25%] h-[34px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px]">
                        Sale Amount
                      </th>
                      <th className="w-[20%] h-[34px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px]">
                        Payment
                      </th>
                      <th className="w-[20%] h-[34px] px-[10px] border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-left text-[7px] font-extrabold uppercase tracking-[0.5px]">
                        Balance After
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerAccount.transactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="bg-transparent hover:bg-[#171b27] transition-colors"
                      >
                        <td className="h-[44px] px-[10px] border-b border-[#202637] text-[#adb5ca] text-[9px]">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </td>
                        <td className="h-[44px] px-[10px] border-b border-[#202637] text-[9px] font-bold">
                          {transaction.type === "sale" ? (
                            <span className="text-[#9592ff]">Sale</span>
                          ) : (
                            <span className="text-[#00c995]">Payment</span>
                          )}
                        </td>
                        <td className="h-[44px] px-[10px] border-b border-[#202637] text-[#dfe2ec] text-[9px]">
                          {transaction.type === "sale"
                            ? formatPKR(
                                transaction.sale?.totalAmount || transaction.amount
                              )
                            : "-"}
                        </td>
                        <td className="h-[44px] px-[10px] border-b border-[#202637] text-[#00c995] text-[9px] font-bold">
                          {transaction.type === "sale"
                            ? formatPKR(transaction.sale?.amountPaid || 0)
                            : formatPKR(transaction.amount)}
                        </td>
                        <td className="h-[44px] px-[10px] border-b border-[#202637] text-[#f5b719] text-[9px] font-bold">
                          {formatPKR(transaction.balanceAfter)}
                        </td>
                      </tr>
                    ))}
                    {customerAccount.transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="h-[60px] text-center text-[#7c86a5] text-[9px]"
                        >
                          No transaction history yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
