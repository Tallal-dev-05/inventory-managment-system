const express = require("express");
const mongoose = require("mongoose");

const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const Purchase = require("../models/Purchase");

const router = express.Router();


// ==========================================
// CREATE PURCHASE
// ==========================================

router.post(
  "/purchases",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        productId,
        supplierName,
        quantity,
        costPrice,
        purchaseDate,
        notes,
      } = req.body;

      // -----------------------------
      // Validate required fields
      // -----------------------------

      if (
        !productId ||
        typeof supplierName !== "string" ||
        supplierName.trim().length < 2 ||
        supplierName.trim().length > 100 ||
        quantity === undefined ||
        costPrice === undefined
      ) {
        return res.status(400).json({
          message:
            "Product, supplier, quantity and cost price are required",
        });
      }

      if (notes && (typeof notes !== "string" || notes.trim().length > 500)) {
        return res.status(400).json({ message: "Notes must be 500 characters or fewer" });
      }
      if (purchaseDate && Number.isNaN(Date.parse(purchaseDate))) {
        return res.status(400).json({ message: "Purchase date is invalid" });
      }

      // -----------------------------
      // Validate product ID
      // -----------------------------

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      // -----------------------------
      // Validate quantity
      // -----------------------------

      if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
        return res.status(400).json({
          message: "Quantity must be a positive whole number",
        });
      }

      // -----------------------------
      // Validate cost price
      // -----------------------------

      if (Number(costPrice) < 0 || Number.isNaN(Number(costPrice))) {
        return res.status(400).json({
          message: "Cost price must be a valid positive number",
        });
      }

      // -----------------------------
      // Find product
      // -----------------------------

      const totalAmount =
        Number(quantity) * Number(costPrice);

      // Atomically increase stock. This prevents simultaneous purchases from
      // overwriting one another's quantities.
      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { quantity: Number(quantity) }, $set: { costPrice: Number(costPrice) } },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // -----------------------------
      // Create purchase
      // -----------------------------

      const purchase = await Purchase.create({
        product: product._id,
        supplierName: supplierName.trim(),
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        totalAmount,
        purchaseDate: purchaseDate || new Date(),
        notes: notes ? notes.trim() : "",
      });

      // -----------------------------
      // Send response
      // -----------------------------

      return res.status(201).json({
        message: "Purchase created successfully",
        purchase,
        product,
      });
    } catch (error) {
      console.error("Create purchase error:", error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// ==========================================
// GET ALL PURCHASES
// ==========================================

router.get(
  "/purchases",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const purchases = await Purchase.find()
        .populate("product", "name sku category")
        .sort({ purchaseDate: -1, createdAt: -1 });

      return res.status(200).json({
        purchases,
      });
    } catch (error) {
      console.error("Get purchases error:", error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);


module.exports = router;
