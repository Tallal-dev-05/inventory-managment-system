import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./Sales.css";
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

        {!showForm && (
          <button
            className="primary-button"
            onClick={
              openNewSale
            }
          >
            + Add Sale
          </button>
        )}

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
          CASH FLOW SUMMARY
      ====================================== */}

      <div className="cash-flow-section">

        <div className="cash-flow-card">

          <span>
            Total Sales
          </span>

          <strong>
            {formatPKR(
              totalSalesAmount
            )}
          </strong>

        </div>

        <div className="cash-flow-card">

          <span>
            Cash Received
          </span>

          <strong>
            {formatPKR(
              totalCashReceived
            )}
          </strong>

        </div>

        <div className="cash-flow-card">

          <span>
            Outstanding
          </span>

          <strong>
            {formatPKR(
              totalOutstanding
            )}
          </strong>

        </div>

      </div>

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
              onClick={
                cancelForm
              }
              disabled={saving}
            >
              ×
            </button>

          </div>

          <form
            onSubmit={
              handleSubmit
            }
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
                        key={
                          product._id
                        }
                        value={
                          product._id
                        }
                      >
                        {product.name} (
                        {
                          product.sku
                        })
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* CUSTOMER */}

              <div className="form-field">

                <label>Customer</label>

                <select
                  value={formData.customerId}
                  onChange={handleCustomerChange}
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} — {formatPKR(customer.balance)} due
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="link-button"
                  onClick={() => setShowNewCustomer(true)}
                >
                  + Create new customer
                </button>

                <small>
                  Select a customer to retrieve their current balance.
                </small>

              </div>

              {/* PREVIOUS BALANCE */}

              <div className="form-field">

                <label>
                  Previous Balance
                </label>

                <input
                  type="text"
                  value={
                    formatPKR(customerBalance)
                  }
                  readOnly
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

              {/* NEW SALE TOTAL */}

              <div className="form-field">

                <label>
                  New Sale Total
                </label>

                <input
                  type="text"
                  value={formatPKR(
                    totalAmount
                  )}
                  readOnly
                />

              </div>

              {/* TOTAL DUE */}

              <div className="form-field">

                <label>
                  Total Due
                </label>

                <input
                  type="text"
                  value={formatPKR(
                    totalDue
                  )}
                  readOnly
                />

              </div>

              {/* PAID NOW */}

              <div className="form-field">

                <label>
                  Paid Now (PKR)
                </label>

                <input
                  type="number"
                  name="amountPaid"
                  value={
                    formData.amountPaid
                  }
                  onChange={
                    handleChange
                  }
                  placeholder={
                    formData.customerName
                      ? "Amount customer pays"
                      : "Full amount"
                  }
                  min="0"
                  step="0.01"
                />

              </div>

              {/* REMAINING */}

              <div className="form-field">

                <label>
                  Remaining Balance
                </label>

                <input
                  type="text"
                  value={formatPKR(
                    remainingBalance
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
                PAYMENT SUMMARY
            ================================== */}

            <div className="payment-summary">

              <div>
                <span>
                  Previous Balance
                </span>

                <strong>
                  {formatPKR(
                    customerBalance
                  )}
                </strong>
              </div>

              <div>
                <span>
                  New Sale
                </span>

                <strong>
                  {formatPKR(
                    totalAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Total Due
                </span>

                <strong>
                  {formatPKR(
                    totalDue
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Paid Now
                </span>

                <strong>
                  {formatPKR(
                    paidAmount
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Remaining
                </span>

                <strong>
                  {formatPKR(
                    remainingBalance
                  )}
                </strong>
              </div>

            </div>

            {/* ==================================
                BUTTONS
            ================================== */}

            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={
                  cancelForm
                }
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

      <div className="sales-table-card customer-list-card">
        <div className="table-header">
          <h2>Customers</h2>
          <span>{customers.length} customer{customers.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="sales-table-wrapper">
          <table className="sales-table">
            <thead><tr><th>Customer Name</th><th>Phone</th><th>Current Outstanding</th><th>Actions</th></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.phone || "-"}</td>
                  <td>{formatPKR(customer.balance)}</td>
                  <td><button type="button" className="secondary-button" onClick={() => openCustomerAccount(customer._id)}>View</button></td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan="4">No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

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
                    Selling Price
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Paid
                  </th>

                  <th>
                    Remaining
                  </th>

                  <th>
                    Profit
                  </th>

                  <th>
                    Date
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
                      key={
                        sale._id
                      }
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
                          sale.amountPaid
                        )}
                      </td>

                      <td>
                        {formatPKR(
                          sale.remainingBalance
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

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => {
                            setInvoiceSale(
                              sale
                            );

                            setInvoiceViewOnly(
                              true
                            );
                          }}
                        >
                          View
                        </button>

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
          INVOICE MODAL
      ====================================== */}

      {invoiceSale && (

        <div className="invoice-modal-overlay">

          <div className="invoice-modal">

            {/* HEADER */}

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
                INVOICE
            ================================== */}

            <div className="invoice-preview">

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

              {/* BILL TO */}

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

              <div className="invoice-cash-flow">

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

                <div className="remaining-row">

                  <span>
                    Remaining Balance
                  </span>

                  <strong>
                    {formatPKR(
                      invoiceSale.remainingBalance
                    )}
                  </strong>

                </div>

              </div>

              {/* NOTES */}

              {invoiceSale.notes && (

                <div className="invoice-notes">

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

              <div className="invoice-thank-you">

                Thank you for your
                business.

              </div>

            </div>

            {/* ==================================
                ACTIONS
            ================================== */}

            <div className="invoice-modal-actions">

              {invoiceViewOnly ? (

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

              ) : (

                <>

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

                  {/* CONFIRM */}

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
                      : "Confirm"}
                  </button>

                </>

              )}

            </div>

          </div>

        </div>

      )}

      {showNewCustomer && (
        <div className="invoice-modal-overlay">
          <form className="invoice-modal customer-modal" onSubmit={createCustomer}>
            <div className="invoice-modal-header">
              <div><h2>New Customer</h2><p>Create and select a customer for this sale.</p></div>
              <button type="button" className="close-button" onClick={() => setShowNewCustomer(false)}>×</button>
            </div>
            <div className="invoice-preview customer-form-fields">
              <label>Name *<input required value={newCustomer.name} onChange={(event) => setNewCustomer((previous) => ({ ...previous, name: event.target.value }))} /></label>
              <label>Phone<input value={newCustomer.phone} onChange={(event) => setNewCustomer((previous) => ({ ...previous, phone: event.target.value }))} /></label>
            </div>
            <div className="invoice-modal-actions"><button type="button" className="secondary-button" onClick={() => setShowNewCustomer(false)}>Cancel</button><button className="primary-button" type="submit">Create Customer</button></div>
          </form>
        </div>
      )}

      {customerAccount && (
        <div className="invoice-modal-overlay">
          <div className="invoice-modal customer-account-modal">
            <div className="invoice-modal-header">
              <div><h2>{customerAccount.customer.name}</h2><p>{customerAccount.customer.phone || "No phone number"} · Outstanding: {formatPKR(customerAccount.customer.balance)}</p></div>
              <button type="button" className="close-button" onClick={() => setCustomerAccount(null)}>×</button>
            </div>
            <form className="receive-payment" onSubmit={receivePayment}>
              <label>Receive Payment (PKR)<input required min="0.01" max={customerAccount.customer.balance} step="0.01" type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></label>
              <button type="submit" className="primary-button">Record Payment</button>
            </form>
            <div className="sales-table-wrapper account-history">
              <table className="sales-table">
                <thead><tr><th>Date</th><th>Type</th><th>Sale</th><th>Payment</th><th>Balance</th></tr></thead>
                <tbody>{customerAccount.transactions.map((transaction) => (
                  <tr key={transaction._id}><td>{new Date(transaction.createdAt).toLocaleDateString()}</td><td>{transaction.type === "sale" ? "Sale" : "Payment"}</td><td>{transaction.type === "sale" ? formatPKR(transaction.sale?.totalAmount || transaction.amount) : "-"}</td><td>{transaction.type === "sale" ? formatPKR(transaction.sale?.amountPaid || 0) : formatPKR(transaction.amount)}</td><td>{formatPKR(transaction.balanceAfter)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Sales;
