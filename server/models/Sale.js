const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    // ==========================================
    // PRODUCT
    // ==========================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // ==========================================
    // CUSTOMER
    // ==========================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    customerName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Walk-in Customer",
    },

    // ==========================================
    // PAYMENT / CREDIT
    // ==========================================

    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    previousBalance: {
      type: Number,
      required: true,
      default: 0,
    },

    remainingBalance: {
      type: Number,
      required: true,
      default: 0,
    },

    // ==========================================
    // SALE INFORMATION
    // ==========================================

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    profit: {
      type: Number,
      required: true,
    },

    // ==========================================
    // DATE
    // ==========================================

    saleDate: {
      type: Date,
      default: Date.now,
    },

    // ==========================================
    // NOTES
    // ==========================================

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sale", saleSchema);