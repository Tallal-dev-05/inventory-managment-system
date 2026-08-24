const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const Product = require("../models/Product");
const Purchase = require("../models/Purchase");
const Sale = require("../models/Sale");

const router = express.Router();

function productPayload(body = {}) {
  const fields = ["name", "sku", "category", "description", "costPrice", "sellingPrice", "quantity", "minimumStock"];
  const payload = Object.fromEntries(fields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
  if (payload.description !== undefined) payload.description = String(payload.description).trim();
  return payload;
}

function sendProductError(error, res) {
  if (error?.code === 11000) return res.status(409).json({ message: "A product with this SKU already exists" });
  if (error?.name === "ValidationError" || error?.name === "CastError") return res.status(400).json({ message: error.message });
  console.error("Product request error:", error.message);
  return res.status(500).json({ message: "Server error" });
}

router.post(
  "/products",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const productData = productPayload(req.body);

      const product = await Product.create(productData);

      return res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error) {
      return sendProductError(error, res);
    }
  }
);

router.get(
  "/products",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const products = await Product.find();

      return res.status(200).json({
        products,
      });
    } catch (error) {
      console.error("Get products error:", error.message);

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

router.put(
  "/products/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        productPayload(req.body),
        {
          new: true,
          runValidators: true,
        }
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    } catch (error) {
      return sendProductError(error, res);
    }
  }
);

router.delete(
  "/products/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const [purchase, sale] = await Promise.all([
        Purchase.exists({ product: req.params.id }),
        Sale.exists({ product: req.params.id }),
      ]);

      if (purchase || sale) {
        return res.status(409).json({
          message: "This product has transaction history and cannot be deleted",
        });
      }

      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error) {
      return sendProductError(error, res);
    }
  }
);

module.exports = router;
