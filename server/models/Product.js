const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 15,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      optional: true,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
        min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumStock: {
      type: Number,
      required: true,
      min: 0,   
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
