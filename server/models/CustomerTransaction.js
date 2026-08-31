const mongoose = require("mongoose");

const customerTransactionSchema =
  new mongoose.Schema(
    {
      // ==========================================
      // CUSTOMER
      // ==========================================

      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },

      // ==========================================
      // TRANSACTION TYPE
      // ==========================================

      type: {
        type: String,
        enum: ["sale", "payment"],
        required: true,
      },

      // ==========================================
      // RELATED SALE
      // ==========================================

      sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
        default: null,
      },

      // ==========================================
      // TRANSACTION AMOUNT
      // ==========================================

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      // ==========================================
      // BALANCES
      // ==========================================

      previousBalance: {
        type: Number,
        required: true,
      },

      balanceAfter: {
        type: Number,
        required: true,
      },

      // ==========================================
      // DESCRIPTION
      // ==========================================

      description: {
        type: String,
        trim: true,
        maxlength: 300,
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "CustomerTransaction",
    customerTransactionSchema
  );