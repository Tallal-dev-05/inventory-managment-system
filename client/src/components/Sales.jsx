import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

// Inline Tailwind-like class utilities (kept as strings for readability)
const pageClass =
  "w-full min-h-screen p-[22px_26px_30px] bg-[#0b0e13] text-[#e8eaf2] text-[11px] font-sans";

const headerClass =
  "min-h-[64px] flex items-start justify-between gap-4 mb-5 pb-4 border-b border-[#232839]";

const titleClass = "mt-[7px] mb-[3px] text-[#f2f3f7] text-[20px] leading-[1.2]";
const subtitleClass = "m-0 text-[#7c86a5] text-[10px] leading-[1.5]";

const backButtonClass =
  "p-0 border-0 bg-transparent text-[#8582ff] text-[9px] font-bold cursor-pointer";

const inputClass =
  "w-full min-w-0 h-[34px] px-2.5 rounded-[7px] border border-[#232839] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] transition focus:border-[#6865f5] focus:ring-[#6865f5]/15 placeholder:text-[#5f6882]";

const textareaClass =
  "w-full min-w-0 min-h-[65px] px-2.5 py-2 rounded-[7px] border border-[#232839] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] leading-[1.5] resize-y transition focus:border-[#6865f5] focus:ring-[#6865f5]/15 placeholder:text-[#5f6882]";

const selectClass =
  "w-full min-w-0 h-[34px] px-2.5 rounded-[7px] border border-[#232839] outline-none bg-[#10141d] text-[#e8eaf2] text-[10px] cursor-pointer transition focus:border-[#6865f5] focus:ring-[#6865f5]/15";

const primaryButton =
  "min-h-[34px] px-[13px] rounded-[7px] border border-[#6865f5] bg-[#6865f5] text-white text-[9px] font-bold cursor-pointer transition hover:bg-[#7773ff] hover:border-[#7773ff] hover:-translate-y-px disabled:opacity-55 disabled:cursor-not-allowed";

const secondaryButton =
  "min-h-[34px] px-[13px] rounded-[7px] border border-[#2c3246] bg-[#1a1f2e] text-[#bbc2db] text-[9px] font-bold cursor-pointer transition hover:border-[#3a425a] hover:bg-[#22283a] disabled:opacity-55 disabled:cursor-not-allowed";

const invoiceButton =
  "min-h-[34px] px-[13px] rounded-[7px] border border-[#075844] bg-[#07372d] text-[#00c995] text-[9px] font-bold cursor-pointer transition hover:bg-[#00c995] hover:text-[#071912]";

const successClass =
  "mb-3 p-2.5 border rounded-[7px] text-[9px] bg-[#07372d] border-[#075844] text-[#00c995]";

const errorClass =
  "mb-3 p-2.5 border rounded-[7px] text-[9px] bg-[#28171d] border-[#64323c] text-[#ff8b96]";

const cashFlowGrid = "grid grid-cols-3 gap-2.5 mb-4";
const cashFlowCard =
  "relative min-h-[90px] p-3.5 border rounded-[10px] bg-[#121620] border-[#232839]";

const saleFormCard = "mb-4 p-4 border rounded-[10px] bg-[#121620] border-[#232839]";
const saleFormHeader =
  "flex items-start justify-between gap-4 mb-3 pb-3 border-b border-[#232839]";

const closeButtonClass =
  "w-7 h-7 grid place-items-center flex-shrink-0 p-0 border rounded-[7px] bg-[#1a1f2e] border-[#2b3144] text-[#9aa3bf] text-[18px] cursor-pointer";

const formGrid = "grid grid-cols-3 gap-3";
const formField = "min-w-0 flex flex-col gap-1.5";
const labelClass = "text-[9px] font-bold text-[#aeb5ca]";
const linkButtonClass = "self-start p-0 bg-transparent text-[#8d89ff] text-[8px] font-bold";
const fullWidthClass = "col-span-full";

const paymentSummaryClass =
  "grid grid-cols-5 gap-[1px] mt-3 overflow-hidden border rounded-[9px] bg-[#232839]";
const paymentSummaryCell = "min-w-0 p-2.5 bg-[#10141d]";

const formActionsClass =
  "flex justify-end gap-2 mt-3 pt-3 border-t border-[#232839]";

const tableCard = "w-full min-w-0 mb-4 overflow-hidden border rounded-[10px] bg-[#121620] border-[#232839]";
const tableHeaderClass =
  "min-h-[54px] flex items-center justify-between gap-4 p-3 border-b border-[#232839]";
const tableHeaderH2 = "m-0 text-[#f0f1f6] text-[13px]";
const tableBadge = "flex-shrink-0 px-2 py-1 rounded-full bg-[#202441] text-[#9592ff] text-[8px] font-bold";

const tableWrapper = "w-full max-w-full overflow-x-auto";
const thClass =
  "h-[36px] px-2.5 border-b border-[#232839] bg-[#10131a] text-[#747e9d] text-[7px] font-extrabold uppercase whitespace-nowrap";
const tdClass =
  "h-[50px] px-2.5 border-b border-[#202637] text-[#adb5ca] text-[8px] align-middle whitespace-nowrap overflow-hidden";

const invoiceOverlay = "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 bg-black/80 backdrop-blur-sm";
const invoiceModalClass =
  "w-full max-w-[690px] max-h-[calc(100vh-36px)] overflow-y-auto border rounded-[12px] bg-[#121620] border-[#2c3246]";
const invoicePreview =
  "m-4 p-4 border rounded-[9px] bg-[#0f131b] border-[#232839]";
const invoiceTop = "flex items-start justify-between gap-4 pb-3 border-b border-[#232839]";
const invoiceNumberClass = "flex flex-col items-end gap-1 text-right";
const invoiceInfoClass = "flex justify-between gap-6 py-3";
const invoiceProductClass =
  "grid grid-cols-[minmax(130px,2fr)_minmax(70px,1fr)_minmax(60px,0.7fr)_minmax(100px,1.3fr)] gap-2 p-3 border rounded-[8px] bg-[#151925] border-[#232839]";
const invoiceCashFlowClass =
  "grid grid-cols-2 gap-[1px] mt-3 overflow-hidden border rounded-[8px] bg-[#232839]";
const invoiceNotesClass = "pt-3";
const invoiceThankYouClass = "mt-4 text-[#7c86a5] text-[8px] text-center";
const invoiceActionsClass =
  "sticky bottom-0 z-10 flex justify-end gap-2 p-3 border-t border-[#232839] bg-[rgba(15,19,27,0.97)] backdrop-blur-sm";
import { formatPKR } from "../utils/currency";
import { api } from "../utils/api";

// ==========================================
// EMPTY FORM
// ==========================================

const emptyForm = {
  productId: "",
  customerId: "",
  customerName: "",
  quantity: "",
  sellingPrice: "",
  amountPaid: "",
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

  /* ==========================================
     HELPERS
  ========================================== */

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

  const productName = safeText(
    sale?.product?.name,
    "Unknown Product"
  );

  const productSku = safeText(sale?.product?.sku);

  const customerName = safeText(
    sale?.customerName,
    "Walk-in Customer"
  );

  const quantity = Number(sale?.quantity || 0);
  const sellingPrice = Number(sale?.sellingPrice || 0);
  const previousBalance = Number(sale?.previousBalance || 0);
  const newSaleAmount = Number(sale?.totalAmount || 0);
  const amountPaid = Number(sale?.amountPaid || 0);

  const totalDue = previousBalance + newSaleAmount;

  const remainingBalance = Number(
    sale?.remainingBalance ?? totalDue - amountPaid
  );

  /* ==========================================
     COLORS
  ========================================== */

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

  /* ==========================================
     PAGE BACKGROUND
  ========================================== */

  setFillColor(colors.page);
  pdf.rect(0, 0, 210, 297, "F");

  /*
   * Main document bounds:
   * left = 15
   * right = 195
   * width = 180
   */

  /* ==========================================
     TOP ACCENT
  ========================================== */

  setFillColor(colors.purple);
  pdf.rect(0, 0, 210, 3, "F");

  /* ==========================================
     HEADER
  ========================================== */

  drawRoundedPanel(15, 13, 180, 31);

  // Logo mark
  setFillColor(colors.purple);
  pdf.roundedRect(22, 20, 17, 17, 4, 4, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  setTextColor(colors.white);
  pdf.text("IM", 30.5, 30.5, {
    align: "center",
  });

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
  pdf.text("SALES INVOICE", 188, 24, {
    align: "right",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setTextColor(colors.muted);
  pdf.text(`#${invoiceNumber}`, 188, 30, {
    align: "right",
  });

  pdf.text(invoiceDate, 188, 35, {
    align: "right",
  });

  /* ==========================================
     CUSTOMER AND INVOICE DETAILS
  ========================================== */

  drawRoundedPanel(15, 50, 88, 29);
  drawRoundedPanel(107, 50, 88, 29);

  drawLabel("Bill To", 21, 58);

  const customerLines = pdf.splitTextToSize(customerName, 72);

  drawValue(
    customerLines.slice(0, 2),
    21,
    66,
    {},
    colors.white,
    11
  );

  drawLabel("Invoice Details", 113, 58);
  drawValue(`#${invoiceNumber}`, 113, 66, {}, colors.text, 9);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setTextColor(colors.muted);
  pdf.text(`Date: ${invoiceDate}`, 113, 72);

  /* ==========================================
     PRODUCT TABLE
  ========================================== */

  drawRoundedPanel(15, 85, 180, 43);

  // Table heading
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setTextColor(colors.white);
  pdf.text("Sale Details", 21, 94);

  // Table header background
  setFillColor(colors.tableHeader);
  pdf.roundedRect(20, 99, 170, 10, 2, 2, "F");

  drawLabel("Product", 24, 105.5);
  drawLabel("SKU", 96, 105.5);
  drawLabel("Qty", 126, 105.5, {
    align: "center",
  });
  drawLabel("Unit Price", 153, 105.5, {
    align: "right",
  });
  drawLabel("Total", 186, 105.5, {
    align: "right",
  });

  // Product row
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
  pdf.text(String(quantity), 126, 118, {
    align: "center",
  });

  pdf.text(money(sellingPrice), 153, 118, {
    align: "right",
  });

  setTextColor(colors.purpleLight);
  pdf.text(money(newSaleAmount), 186, 118, {
    align: "right",
  });

  /* ==========================================
     PAYMENT SUMMARY
  ========================================== */

  drawRoundedPanel(15, 134, 180, 70);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setTextColor(colors.white);
  pdf.text("Payment Summary", 21, 144);

  // Divider
  setDrawColor(colors.border);
  pdf.setLineWidth(0.3);
  pdf.line(21, 149, 189, 149);

  const summaryRows = [
    {
      label: "Previous balance",
      value: previousBalance,
      color: colors.text,
    },
    {
      label: "New sale",
      value: newSaleAmount,
      color: colors.text,
    },
    {
      label: "Total amount due",
      value: totalDue,
      color: colors.purpleLight,
    },
    {
      label: "Paid now",
      value: amountPaid,
      color: colors.green,
    },
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
    pdf.text(money(row.value), 186, rowY, {
      align: "right",
    });

    rowY += 9;
  });

  /* ==========================================
     REMAINING BALANCE
  ========================================== */

  setFillColor([16, 37, 31]);
  setDrawColor([7, 88, 68]);

  pdf.roundedRect(21, 187, 168, 11, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  setTextColor(colors.green);
  pdf.text("Remaining Balance", 26, 194);

  pdf.setFontSize(10);
  pdf.text(money(remainingBalance), 184, 194, {
    align: "right",
  });

  /* ==========================================
     PAYMENT STATUS BADGE
  ========================================== */

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
  pdf.text(
    isPaid ? "PAID" : "PAYMENT DUE",
    34,
    215.7,
    {
      align: "center",
    }
  );

  /* ==========================================
     NOTES
  ========================================== */

  if (sale?.notes) {
    drawRoundedPanel(15, 225, 180, 30);

    drawLabel("Notes", 21, 233);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    setTextColor(colors.muted);

    const notes = pdf.splitTextToSize(
      safeText(sale.notes),
      164
    );

    pdf.text(notes.slice(0, 3), 21, 240);
  }

  /* ==========================================
     FOOTER
  ========================================== */

  const footerY = sale?.notes ? 270 : 250;

  setDrawColor(colors.border);
  pdf.line(15, footerY, 195, footerY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setTextColor(colors.purpleLight);
  pdf.text(
    "Thank you for your business.",
    105,
    footerY + 8,
    {
      align: "center",
    }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  setTextColor(colors.muted);
  pdf.text(
    "Generated by Inventory Management System",
    105,
    footerY + 14,
    {
      align: "center",
    }
  );

  pdf.text(
    `Invoice #${invoiceNumber}`,
    15,
    289
  );

  pdf.text(
    "Page 1 of 1",
    195,
    289,
    {
      align: "right",
    }
  );

  /* ==========================================
     SAVE PDF
  ========================================== */

  pdf.save(`invoice-${invoiceNumber}.pdf`);
}

// ==========================================
// SALES COMPONENT
// ==========================================

function Sales() {
  const navigate =
    useNavigate();

  // ==========================================
  // DATA
  // ==========================================

  const [products, setProducts] =
    useState([]);

  const [sales, setSales] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);

  const [customerAccount, setCustomerAccount] =
    useState(null);

  const [showNewCustomer, setShowNewCustomer] =
    useState(false);

  const [newCustomer, setNewCustomer] =
    useState({ name: "", phone: "" });

  const [paymentAmount, setPaymentAmount] =
    useState("");

  // ==========================================
  // UI
  // ==========================================

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [finalizing, setFinalizing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ==========================================
  // FORM
  // ==========================================

  const [formData, setFormData] =
    useState(emptyForm);

  // ==========================================
  // CUSTOMER BALANCE
  // ==========================================

  const [customerBalance, setCustomerBalance] =
    useState(0);

  // ==========================================
  // INVOICE
  // ==========================================

  const [invoiceSale, setInvoiceSale] =
    useState(null);

  const [invoiceViewOnly, setInvoiceViewOnly] =
    useState(false);

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
      const response = await fetch(api("/api/products"), {
        method: "GET",
        credentials: "include",
      });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to get products"
        );
      }

      setProducts(
        data.products || []
      );
    } catch (error) {
      setError(
        error.message
      );
    }
  }

  // ==========================================
  // GET SALES
  // ==========================================

  async function getSales() {
    try {
      const response = await fetch(api("/api/sales"), {
        method: "GET",
        credentials: "include",
      });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to get sales"
        );
      }

      setSales(
        data.sales || []
      );
    } catch (error) {
      setError(
        error.message
      );
    }
  }

  async function getCustomers() {
    const response = await fetch(api("/api/customers"), {
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to get customers");
    setCustomers(data.customers || []);
    return data.customers || [];
  }

  async function openCustomerAccount(customerId) {
    try {
      const response = await fetch(api(`/api/customers/${customerId}/transactions`), { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get customer account");
      setCustomerAccount(data);
      setPaymentAmount("");
    } catch (error) {
      setError(error.message);
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
    } catch (error) {
      setError(error.message);
    }
  }

  async function receivePayment(event) {
    event.preventDefault();
    if (!customerAccount) return;
    try {
      const response = await fetch(api(`/api/customers/${customerAccount.customer._id}/payment`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(paymentAmount) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to record payment");
      setCustomers((previous) => previous.map((customer) =>
        customer._id === data.customer._id ? data.customer : customer
      ));
      setCustomerAccount((previous) => previous && ({
        customer: data.customer,
        transactions: [data.transaction, ...previous.transactions],
      }));
      setCustomerBalance((previous) =>
        customerAccount.customer._id === formData.customerId
          ? Number(data.customer.balance || 0)
          : previous
      );
      setPaymentAmount("");
      await getCustomers();
      setSuccess("Payment recorded successfully.");
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

      try {
        await Promise.all([
          getProducts(),
          getSales(),
          getCustomers(),
        ]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ==========================================
  // CUSTOMER NAME CHANGE
  // ==========================================

  async function handleCustomerChange(
    event
  ) {
    const value =
      event.target.value;

    const customer = customers.find((item) => item._id === value);
    setFormData((previous) => ({
      ...previous,
      customerId: value,
      customerName: customer?.name || "",
    }));
    setCustomerBalance(Number(customer?.balance || 0));

    setError("");
    setSuccess("");

    if (!value) return;

    try {
      const response = await fetch(
        api(`/api/customers/${value}`),
        { credentials: "include" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get customer");
      setFormData((previous) => ({
        ...previous,
        customerId: data.customer._id,
        customerName: data.customer.name,
      }));
      setCustomerBalance(Number(data.customer.balance || 0));
    } catch (error) {
      setError(error.message);
    }
  }

  // ==========================================
  // FORM CHANGE
  // ==========================================

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    setError("");
    setSuccess("");
  }

  // ==========================================
  // PRODUCT CHANGE
  // ==========================================

  function handleProductChange(
    event
  ) {
    const productId =
      event.target.value;

    const selectedProduct =
      products.find(
        (product) =>
          product._id ===
          productId
      );

    setFormData(
      (previous) => ({
        ...previous,

        productId,

        sellingPrice:
          selectedProduct
            ? selectedProduct.sellingPrice
            : "",
      })
    );

    setError("");
    setSuccess("");
  }

  // ==========================================
  // SELECTED PRODUCT
  // ==========================================

  const selectedProduct =
    products.find(
      (product) =>
        product._id ===
        formData.productId
    );

  // ==========================================
  // SALE TOTAL
  // ==========================================

  const totalAmount =
    Number(
      formData.quantity || 0
    ) *
    Number(
      formData.sellingPrice || 0
    );

  // ==========================================
  // TOTAL DUE
  // ==========================================

  const totalDue =
    Number(customerBalance || 0) +
    totalAmount;

  // ==========================================
  // PAID NOW
  // ==========================================

  const paidAmount =
    Number(
      formData.amountPaid || 0
    );

  // ==========================================
  // REMAINING BALANCE
  // ==========================================

  const remainingBalance =
    Math.max(
      0,
      totalDue - paidAmount
    );

  // ==========================================
  // PROFIT
  // ==========================================

  const estimatedProfit =
    Number(
      formData.quantity || 0
    ) *
    (
      Number(
        formData.sellingPrice || 0
      ) -
      Number(
        selectedProduct?.costPrice ||
          0
      )
    );

  // ==========================================
  // CASH FLOW SUMMARY
  // ==========================================

  const totalSalesAmount =
    sales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.totalAmount || 0
        ),
      0
    );

  const totalCashReceived =
    sales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.amountPaid || 0
        ),
      0
    );

  const totalOutstanding =
    customers.reduce(
      (sum, customer) =>
        sum +
        Number(
          customer.balance || 0
        ),
      0
    );

  // ==========================================
  // SAVE / UPDATE SALE
  // ==========================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // PRODUCT
    // ========================================

    if (!formData.productId) {
      setError(
        "Please select a product"
      );
      return;
    }

    // ========================================
    // QUANTITY
    // ========================================

    if (!formData.quantity) {
      setError(
        "Please enter quantity"
      );
      return;
    }

    if (
      !Number.isInteger(
        Number(
          formData.quantity
        )
      ) ||
      Number(
        formData.quantity
      ) <= 0
    ) {
      setError(
        "Quantity must be a positive whole number"
      );
      return;
    }

    // ========================================
    // STOCK
    // ========================================

    if (
      selectedProduct &&
      Number(
        formData.quantity
      ) >
        Number(
          selectedProduct.quantity
        )
    ) {
      setError(
        `Insufficient stock. Available stock: ${selectedProduct.quantity}`
      );
      return;
    }

    // ========================================
    // SELLING PRICE
    // ========================================

    if (
      formData.sellingPrice ===
        "" ||
      Number(
        formData.sellingPrice
      ) < 0
    ) {
      setError(
        "Please enter a valid selling price"
      );
      return;
    }

    // ========================================
    // CUSTOMER
    // ========================================

    const customerName = formData.customerName.trim();

    const isWalkIn =
      !customerName ||
      customerName.toLowerCase() ===
        "walk-in customer";

    // ========================================
    // PAID AMOUNT
    // ========================================

    const payment =
      formData.amountPaid ===
        ""
        ? isWalkIn
          ? totalAmount
          : 0
        : Number(
            formData.amountPaid
          );

    if (
      Number.isNaN(payment) ||
      payment < 0
    ) {
      setError(
        "Please enter a valid paid amount"
      );
      return;
    }

    // ========================================
    // WALK-IN
    // ========================================

    if (
      isWalkIn &&
      payment < totalAmount
    ) {
      setError(
        "Enter a customer name if you want to give credit. Walk-in Customer must pay the full sale amount."
      );
      return;
    }

    // ========================================
    // PAYMENT LIMIT
    // ========================================

    const calculatedTotalDue =
      Number(
        customerBalance || 0
      ) +
      totalAmount;

    if (
      payment >
      calculatedTotalDue
    ) {
      setError(
        `Paid amount cannot exceed total amount due of ${formatPKR(
          calculatedTotalDue
        )}`
      );
      return;
    }

    try {
      setSaving(true);

      const isEditing =
        Boolean(
          editingSaleId
        );

      const url = isEditing
        ? api(`/api/sales/${editingSaleId}`)
        : api("/api/sales");

      const method = isEditing
        ? "PUT"
        : "POST";

      const response =
        await fetch(url, {
          method,

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId:
              formData.productId,

            customerId: formData.customerId || undefined,

            customerName:
              customerName,

            quantity:
              Number(
                formData.quantity
              ),

            sellingPrice:
              Number(
                formData.sellingPrice
              ),

            amountPaid:
              payment,

            saleDate:
              formData.saleDate ||
              undefined,

            notes:
              formData.notes.trim(),
          }),
        });

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

      const updatedSale =
        data.sale;

      if (!updatedSale) {
        throw new Error(
          "Sale information was not returned by the server."
        );
      }

      // ========================================
      // RESET
      // ========================================

      setFormData(
        emptyForm
      );

      setShowForm(false);

      setEditingSaleId(
        null
      );

      setCustomerBalance(0);

      // ========================================
      // OPEN INVOICE
      // ========================================

      setInvoiceSale(
        updatedSale
      );

      setInvoiceViewOnly(
        false
      );

      // ========================================
      // REFRESH
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
      setError(
        error.message
      );
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

    const productId =
      invoiceSale.product?._id ||
      invoiceSale.product;

    let saleDate = "";

    if (
      invoiceSale.saleDate
    ) {
      const date =
        new Date(
          invoiceSale.saleDate
        );

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        saleDate =
          date
            .toISOString()
            .split("T")[0];
      }
    }

    setFormData({
      productId:
        productId || "",

      customerId:
        invoiceSale.customer?._id || invoiceSale.customer || "",

      customerName:
        invoiceSale.customerName ===
        "Walk-in Customer"
          ? ""
          : invoiceSale.customerName ||
            "",

      quantity:
        invoiceSale.quantity ||
        "",

      sellingPrice:
        invoiceSale.sellingPrice ??
        "",

      amountPaid:
        invoiceSale.amountPaid ??
        "",

      saleDate,

      notes:
        invoiceSale.notes ||
        "",
    });

    setEditingSaleId(
      invoiceSale._id
    );

    setInvoiceSale(null);

    setShowForm(true);

    setError("");
    setSuccess("");

    setCustomerBalance(Number(invoiceSale.customer?.balance || 0));
  }

  // ==========================================
  // FINALIZE SALE
  // ==========================================

  async function handleDoneInvoice() {
    if (
      !invoiceSale?._id
    ) {
      setError(
        "Invalid sale. Cannot finalize."
      );
      return;
    }

    try {
      setFinalizing(
        true
      );

      setError("");

      const response =
        await fetch(
          api(`/api/sales/${invoiceSale._id}/finalize`),
          {
            method: "POST",

            credentials:
              "include",

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

      setInvoiceSale(
        null
      );

      // ========================================
      // REFRESH
      // ========================================

      await Promise.all([
        getProducts(),
        getSales(),
        getCustomers(),
      ]);

      setSuccess(
        "Sale completed successfully!"
      );
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setFinalizing(
        false
      );
    }
  }

  // ==========================================
  // CANCEL FORM
  // ==========================================

  function cancelForm() {
    setShowForm(false);

    setFormData(
      emptyForm
    );

    setEditingSaleId(
      null
    );

    setCustomerBalance(0);

    setError("");
    setSuccess("");
  }

  // ==========================================
  // CLOSE INVOICE
  // ==========================================

  function closeInvoice() {
    setInvoiceSale(null);
    setInvoiceViewOnly(
      false
    );
  }

  // ==========================================
  // NEW SALE
  // ==========================================

  function openNewSale() {
    setShowForm(true);

    setEditingSaleId(
      null
    );

    setFormData(
      emptyForm
    );

    setCustomerBalance(0);

    setError("");
    setSuccess("");
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className={pageClass}>
        <h1 className={titleClass}>Sales</h1>

        <p className={subtitleClass}>Loading sales...</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className={pageClass}>

      {/* ======================================
          HEADER
      ====================================== */}

      <div className={headerClass}>

        <div>

          <button
            className={backButtonClass}
            type="button"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Back to dashboard
          </button>

          <h1 className={titleClass}>Sales</h1>

          <p className={subtitleClass}>Record products sold to customers</p>

        </div>

        {!showForm && (
          <button className={primaryButton} onClick={openNewSale}>
            + Add Sale
          </button>
        )}

      </div>

      {/* ======================================
          SUCCESS
      ====================================== */}

      {success && <div className={successClass}>{success}</div>}

      {/* ======================================
          ERROR
      ====================================== */}

      {error && <div className={errorClass}>{error}</div>}

      {/* ======================================
          CASH FLOW SUMMARY
      ====================================== */}

      <div className={cashFlowGrid}>
        <div className={cashFlowCard}>
          <span className="block text-[#7c86a5] text-[8px] font-[800] uppercase">Total Sales</span>
          <strong className="block mt-3 text-[#f1f2f6] text-[19px] font-semibold">{formatPKR(totalSalesAmount)}</strong>
        </div>

        <div className={cashFlowCard}>
          <span className="block text-[#7c86a5] text-[8px] font-[800] uppercase">Cash Received</span>
          <strong className="block mt-3 text-[#f1f2f6] text-[19px] font-semibold">{formatPKR(totalCashReceived)}</strong>
        </div>

        <div className={cashFlowCard}>
          <span className="block text-[#7c86a5] text-[8px] font-[800] uppercase">Outstanding</span>
          <strong className="block mt-3 text-[#f1f2f6] text-[19px] font-semibold">{formatPKR(totalOutstanding)}</strong>
        </div>
      </div>

      {/* ======================================
          ADD / EDIT SALE FORM
      ====================================== */}

      {showForm && (
        <div className={saleFormCard}>
          <div className={saleFormHeader}>
            <h2 className="m-0 text-[#f0f1f6] text-[14px]">{editingSaleId ? "Edit Sale" : "Add Sale"}</h2>

            <button type="button" className={closeButtonClass} onClick={cancelForm} disabled={saving}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={formGrid}>
              {/* PRODUCT */}
              <div className={formField}>
                <label className={labelClass}>Product *</label>
                <select name="productId" value={formData.productId} onChange={handleProductChange} required className={selectClass}>
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* CUSTOMER */}
              <div className={formField}>
                <label className={labelClass}>Customer</label>
                <select value={formData.customerId} onChange={handleCustomerChange} className={selectClass}>
                  <option value="">Walk-in Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} — {formatPKR(customer.balance)} due
                    </option>
                  ))}
                </select>

                <button type="button" className={linkButtonClass} onClick={() => setShowNewCustomer(true)}>
                  + Create new customer
                </button>

                <small className="text-[#7c86a5] text-[7px]">Select a customer to retrieve their current balance.</small>
              </div>

              {/* PREVIOUS BALANCE */}
              <div className={formField}>
                <label className={labelClass}>Previous Balance</label>
                <input type="text" value={formatPKR(customerBalance)} readOnly className={inputClass + " bg-[#181c28] border-[#2c3246] text-[#c4cada] font-bold"} />
              </div>

              {/* AVAILABLE STOCK */}
              <div className={formField}>
                <label className={labelClass}>Available Stock</label>
                <input type="text" value={selectedProduct ? selectedProduct.quantity : "-"} readOnly className={inputClass + " bg-[#181c28] border-[#2c3246] text-[#c4cada] font-bold"} />
              </div>

              {/* QUANTITY */}
              <div className={formField}>
                <label className={labelClass}>Quantity *</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Enter quantity" min="1" step="1" required className={inputClass} />
              </div>

              {/* SELLING PRICE */}
              <div className={formField}>
                <label className={labelClass}>Selling Price (PKR) *</label>
                <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} placeholder="Enter selling price" min="0" step="0.01" required className={inputClass} />
              </div>

              {/* NEW SALE TOTAL */}
              <div className={formField}>
                <label className={labelClass}>New Sale Total</label>
                <input type="text" value={formatPKR(totalAmount)} readOnly className={inputClass + " bg-[#10141d]"} />
              </div>

              {/* TOTAL DUE */}
              <div className={formField}>
                <label className={labelClass}>Total Due</label>
                <input type="text" value={formatPKR(totalDue)} readOnly className={inputClass + " bg-[#10141d]"} />
              </div>

              {/* PAID NOW */}
              <div className={formField}>
                <label className={labelClass}>Paid Now (PKR)</label>
                <input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} placeholder={formData.customerName ? "Amount customer pays" : "Full amount"} min="0" step="0.01" className={inputClass} />
              </div>

              {/* REMAINING */}
              <div className={formField}>
                <label className={labelClass}>Remaining Balance</label>
                <input type="text" value={formatPKR(remainingBalance)} readOnly className={inputClass + " bg-[#10141d]"} />
              </div>

              {/* PROFIT */}
              <div className={formField}>
                <label className={labelClass}>Estimated Profit (PKR)</label>
                <input type="text" value={formatPKR(estimatedProfit)} readOnly className={inputClass + " bg-[#10141d]"} />
              </div>

              {/* SALE DATE */}
              <div className={formField}>
                <label className={labelClass}>Sale Date</label>
                <input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} className={inputClass} />
              </div>

              {/* NOTES */}
              <div className={formField + " " + fullWidthClass}>
                <label className={labelClass}>Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional notes" rows="3" className={textareaClass} />
              </div>
            </div>

            {/* PAYMENT SUMMARY */}
            <div className={paymentSummaryClass}>
              <div className={paymentSummaryCell}>
                <span className="block text-[#7c86a5] text-[7px] font-[800] uppercase">Previous Balance</span>
                <strong className="block mt-1 text-[#dfe2ec] text-[10px]">{formatPKR(customerBalance)}</strong>
              </div>
              <div className={paymentSummaryCell}>
                <span className="block text-[#7c86a5] text-[7px] font-[800] uppercase">New Sale</span>
                <strong className="block mt-1 text-[#dfe2ec] text-[10px]">{formatPKR(totalAmount)}</strong>
              </div>
              <div className={paymentSummaryCell}>
                <span className="block text-[#7c86a5] text-[7px] font-[800] uppercase">Total Due</span>
                <strong className="block mt-1 text-[#dfe2ec] text-[10px]">{formatPKR(totalDue)}</strong>
              </div>
              <div className={paymentSummaryCell}>
                <span className="block text-[#7c86a5] text-[7px] font-[800] uppercase">Paid Now</span>
                <strong className="block mt-1 text-[#dfe2ec] text-[10px]">{formatPKR(paidAmount)}</strong>
              </div>
              <div className={paymentSummaryCell + " bg-[#10251f]"}>
                <span className="block text-[#7c86a5] text-[7px] font-[800] uppercase">Remaining</span>
                <strong className="block mt-1 text-[#00c995] text-[10px]">{formatPKR(remainingBalance)}</strong>
              </div>
            </div>

            {/* BUTTONS */}
            <div className={formActionsClass}>
              <button type="button" className={secondaryButton} onClick={cancelForm} disabled={saving}>Cancel</button>
              <button type="submit" className={primaryButton} disabled={saving}>
                {saving ? (editingSaleId ? "Updating..." : "Saving...") : editingSaleId ? "Update Sale" : "Save Sale"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={tableCard}>
        <div className={tableHeaderClass}>
          <h2 className={tableHeaderH2}>Customers</h2>
          <span className={tableBadge}>{customers.length} customer{customers.length !== 1 ? "s" : ""}</span>
        </div>
        <div className={tableWrapper}>
          <table className="w-full min-w-[620px] table-fixed border-collapse">
            <thead>
              <tr>
                <th className={thClass}>Customer Name</th>
                <th className={thClass}>Phone</th>
                <th className={thClass}>Current Outstanding</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td className={tdClass}>{customer.name}</td>
                  <td className={tdClass}>{customer.phone || "-"}</td>
                  <td className={tdClass}>{formatPKR(customer.balance)}</td>
                  <td className={tdClass}><button type="button" className={secondaryButton} onClick={() => openCustomerAccount(customer._id)}>View</button></td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td className={tdClass} colSpan="4">No customers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================
          SALES HISTORY
      ====================================== */}

      <div className={tableCard}>
        <div className={tableHeaderClass}>
          <h2 className={tableHeaderH2}>Sales History</h2>
          <span className={tableBadge}>{sales.length} sale{sales.length !== 1 ? "s" : ""}</span>
        </div>

        {sales.length === 0 ? (
          <div className="min-h-[170px] flex flex-col items-center justify-center p-[28px_18px] text-[#7c86a5] text-center">
            <h3 className="m-0 text-[#dfe2ec] text-[12px]">No sales found</h3>
            <p className="max-w-[300px] m-0 text-[9px] leading-[1.5]">Click "Add Sale" to record your first sale.</p>
          </div>
        ) : (
          <div className={tableWrapper}>
            <table className="w-full min-w-[1180px] table-fixed border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Product</th>
                  <th className={thClass}>SKU</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Quantity</th>
                  <th className={thClass}>Selling Price</th>
                  <th className={thClass}>Total</th>
                  <th className={thClass}>Paid</th>
                  <th className={thClass}>Remaining</th>
                  <th className={thClass}>Profit</th>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className={tdClass}>{sale.product?.name || "Unknown Product"}</td>
                    <td className={tdClass}>{sale.product?.sku || "-"}</td>
                    <td className={tdClass}>{sale.customerName || "Walk-in Customer"}</td>
                    <td className={tdClass}>{sale.quantity}</td>
                    <td className={tdClass}>{formatPKR(sale.sellingPrice)}</td>
                    <td className={tdClass}>{formatPKR(sale.totalAmount)}</td>
                    <td className={tdClass}>{formatPKR(sale.amountPaid)}</td>
                    <td className={tdClass}>{formatPKR(sale.remainingBalance)}</td>
                    <td className={tdClass}>{formatPKR(sale.profit)}</td>
                    <td className={tdClass}>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : "-"}</td>
                    <td className={tdClass}>
                      <button type="button" className={secondaryButton} onClick={() => { setInvoiceSale(sale); setInvoiceViewOnly(true); }}>View</button>
                      <button type="button" className={invoiceButton} onClick={() => downloadInvoice(sale)}>Download</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================
          INVOICE MODAL
      ====================================== */}

      {invoiceSale && (
        <div className={invoiceOverlay}>
          <div className={invoiceModalClass}>

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4 p-3 border-b border-[#232839] bg-[rgba(18,22,32,0.97)] backdrop-blur-sm">

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
                className={closeButtonClass}
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
                INVOICE
            ================================== */}

            <div className={invoicePreview}>
              <div className={invoiceTop}>

                <div>

                  <h1>
                    INVENTORY
                  </h1>

                  <p>
                    Sales Invoice
                  </p>

                </div>

                <div className={invoiceNumberClass}>

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

              {/* BILL TO */}

              <div className={invoiceInfoClass}>

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

              <div className={invoiceProductClass}>

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
                    {
                      invoiceSale.quantity
                    }
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

              {/* ==================================
                  CASH FLOW
              ================================== */}

              <div className={invoiceCashFlowClass}>

                <div>

                  <span>
                    Previous Balance
                  </span>

                  <strong>
                    {formatPKR(
                      invoiceSale.previousBalance
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    New Sale
                  </span>

                  <strong>
                    {formatPKR(
                      invoiceSale.totalAmount
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Total Due
                  </span>

                  <strong>
                    {formatPKR(
                      Number(
                        invoiceSale.previousBalance ||
                          0
                      ) +
                        Number(
                          invoiceSale.totalAmount ||
                            0
                        )
                    )}
                  </strong>

                </div>

                <div>

                  <span>
                    Paid Now
                  </span>

                  <strong>
                    {formatPKR(
                      invoiceSale.amountPaid
                    )}
                  </strong>

                </div>

                <div className="col-span-full bg-[#10251f] p-2.5">
                  <span className="text-[#7c86a5] text-[8px] font-[700] uppercase">Remaining Balance</span>
                  <strong className="text-[#00c995]">{formatPKR(invoiceSale.remainingBalance)}</strong>
                </div>

              </div>

              {/* NOTES */}

              {invoiceSale.notes && (

                <div className={invoiceNotesClass}>

                  <span>
                    Notes
                  </span>

                  <p>
                    {
                      invoiceSale.notes
                    }
                  </p>

                </div>

              )}

              {/* FOOTER */}

              <div className={invoiceThankYouClass}>Thank you for your business.</div>

            </div>

            {/* ==================================
                ACTIONS
            ================================== */}

            <div className={invoiceActionsClass}>

              {invoiceViewOnly ? (

                <button type="button" className={secondaryButton} onClick={() => downloadInvoice(invoiceSale)} disabled={finalizing}>Download Invoice</button>

              ) : (

                <>

                  {/* EDIT */}

                  <button type="button" className={secondaryButton} onClick={handleEditInvoice} disabled={finalizing}>Edit</button>

                  {/* DOWNLOAD */}

                  <button type="button" className={secondaryButton} onClick={() => downloadInvoice(invoiceSale)} disabled={finalizing}>Download Invoice</button>

                  {/* CONFIRM */}

                  <button type="button" className={primaryButton} onClick={handleDoneInvoice} disabled={finalizing}>{finalizing ? "Completing..." : "Confirm"}</button>

                </>

              )}

            </div>

          </div>

        </div>

      )}

      {showNewCustomer && (
        <div className={invoiceOverlay}>
          <form className={`${invoiceModalClass} max-w-[470px]`} onSubmit={createCustomer}>
            <div className="flex items-start justify-between gap-4 p-3 border-b border-[#232839] bg-[rgba(18,22,32,0.97)] backdrop-blur-sm">
              <div>
                <h2 className="m-0 text-[#f1f2f6] text-[14px]">New Customer</h2>
                <p className="m-0 text-[#7c86a5] text-[8px]">Create and select a customer for this sale.</p>
              </div>
              <button type="button" className={closeButtonClass} onClick={() => setShowNewCustomer(false)}>×</button>
            </div>
            <div className={invoicePreview + " customer-form-fields"}>
              <label className="grid gap-1">
                <span className="text-[9px] font-bold text-[#aeb5ca]">Name *</span>
                <input required value={newCustomer.name} onChange={(event) => setNewCustomer((previous) => ({ ...previous, name: event.target.value }))} className={inputClass} />
              </label>
              <label className="grid gap-1">
                <span className="text-[9px] font-bold text-[#aeb5ca]">Phone</span>
                <input value={newCustomer.phone} onChange={(event) => setNewCustomer((previous) => ({ ...previous, phone: event.target.value }))} className={inputClass} />
              </label>
            </div>
            <div className={invoiceActionsClass}><button type="button" className={secondaryButton} onClick={() => setShowNewCustomer(false)}>Cancel</button><button className={primaryButton} type="submit">Create Customer</button></div>
          </form>
        </div>
      )}

      {customerAccount && (
        <div className={invoiceOverlay}>
          <div className={`${invoiceModalClass} max-w-[820px]`}>
            <div className="flex items-start justify-between gap-4 p-3 border-b border-[#232839] bg-[rgba(18,22,32,0.97)] backdrop-blur-sm">
              <div>
                <h2 className="m-0 text-[#f1f2f6] text-[14px]">{customerAccount.customer.name}</h2>
                <p className="m-0 text-[#7c86a5] text-[8px]">{customerAccount.customer.phone || "No phone number"} · Outstanding: {formatPKR(customerAccount.customer.balance)}</p>
              </div>
              <button type="button" className={closeButtonClass} onClick={() => setCustomerAccount(null)}>×</button>
            </div>
            <form className="grid grid-cols-[1fr_auto] items-end gap-2 p-3 border-b border-[#232839]" onSubmit={receivePayment}>
              <label className="grid gap-1 text-[9px] font-bold text-[#aeb5ca]">Receive Payment (PKR)<input required min="0.01" max={customerAccount.customer.balance} step="0.01" type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} className={inputClass} /></label>
              <button type="submit" className={primaryButton}>Record Payment</button>
            </form>
            <div className={tableWrapper + " mt-3 border rounded-[8px]"}>
              <table className="w-full min-w-[600px] table-fixed border-collapse">
                <thead>
                  <tr>
                    <th className={thClass}>Date</th>
                    <th className={thClass}>Type</th>
                    <th className={thClass}>Sale</th>
                    <th className={thClass}>Payment</th>
                    <th className={thClass}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {customerAccount.transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className={tdClass}>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                      <td className={tdClass}>{transaction.type === "sale" ? "Sale" : "Payment"}</td>
                      <td className={tdClass}>{transaction.type === "sale" ? formatPKR(transaction.sale?.totalAmount || transaction.amount) : "-"}</td>
                      <td className={tdClass}>{transaction.type === "sale" ? formatPKR(transaction.sale?.amountPaid || 0) : formatPKR(transaction.amount)}</td>
                      <td className={tdClass}>{formatPKR(transaction.balanceAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Sales;
