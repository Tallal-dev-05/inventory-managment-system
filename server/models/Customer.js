const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    // ==========================================
    // CUSTOMER NAME
    // ==========================================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },

    // ==========================================
    // PHONE
    // ==========================================

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    // ==========================================
    // CURRENT BALANCE
    //
    // Positive = customer owes us
    // Zero = nothing outstanding
    // ==========================================

    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Customer", customerSchema);
