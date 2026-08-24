const express = require("express");
const mongoose = require("mongoose");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const Product = require("../models/Product");
const Sale = require("../models/Sale");

const router = express.Router();

// ==========================================
// CREATE PENDING SALE
// ==========================================

router.post(
  "/sales",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        productId,
        customerName,
        quantity,
        sellingPrice,
        saleDate,
        notes,
      } = req.body;

      // ==========================================
      // VALIDATE REQUIRED FIELDS
      // ==========================================

      if (
        !productId ||
        quantity === undefined ||
        sellingPrice === undefined
      ) {
        return res.status(400).json({
          message:
            "Product, quantity and selling price are required",
        });
      }

      // ==========================================
      // VALIDATE CUSTOMER NAME
      // ==========================================

      if (
        customerName &&
        (
          typeof customerName !== "string" ||
          customerName.trim().length > 100
        )
      ) {
        return res.status(400).json({
          message:
            "Customer name must be 100 characters or fewer",
        });
      }

      // ==========================================
      // VALIDATE NOTES
      // ==========================================

      if (
        notes &&
        (
          typeof notes !== "string" ||
          notes.trim().length > 500
        )
      ) {
        return res.status(400).json({
          message:
            "Notes must be 500 characters or fewer",
        });
      }

      // ==========================================
      // VALIDATE DATE
      // ==========================================

      if (
        saleDate &&
        Number.isNaN(Date.parse(saleDate))
      ) {
        return res.status(400).json({
          message: "Sale date is invalid",
        });
      }

      // ==========================================
      // VALIDATE PRODUCT ID
      // ==========================================

      if (
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      // ==========================================
      // VALIDATE QUANTITY
      // ==========================================

      if (
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a positive whole number",
        });
      }

      // ==========================================
      // VALIDATE SELLING PRICE
      // ==========================================

      if (
        Number.isNaN(Number(sellingPrice)) ||
        Number(sellingPrice) < 0
      ) {
        return res.status(400).json({
          message:
            "Selling price must be a valid number",
        });
      }

      // ==========================================
      // FIND PRODUCT
      // ==========================================

      const product =
        await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // ==========================================
      // CHECK CURRENT STOCK
      // ==========================================

      if (
        Number(product.quantity) <
        Number(quantity)
      ) {
        return res.status(400).json({
          message: `Insufficient stock. Available stock: ${product.quantity}`,
        });
      }

      // ==========================================
      // CALCULATE SALE
      // ==========================================

      const quantityNumber =
        Number(quantity);

      const sellingPriceNumber =
        Number(sellingPrice);

      const costPriceNumber =
        Number(product.costPrice);

      const totalAmount =
        quantityNumber *
        sellingPriceNumber;

      const totalCost =
        quantityNumber *
        costPriceNumber;

      const profit =
        totalAmount -
        totalCost;

      // ==========================================
      // CREATE PENDING SALE
      // ==========================================

      const sale = await Sale.create({
        product: product._id,

        customerName:
          customerName &&
          customerName.trim()
            ? customerName.trim()
            : "Walk-in Customer",

        quantity: quantityNumber,

        sellingPrice:
          sellingPriceNumber,

        totalAmount,

        costPrice:
          costPriceNumber,

        profit,

        saleDate:
          saleDate || new Date(),

        notes:
          notes
            ? notes.trim()
            : "",

        // IMPORTANT
        status: "pending",
      });

      // Populate product so frontend
      // can immediately show invoice
      await sale.populate(
        "product",
        "name sku category"
      );

      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(201).json({
        message:
          "Sale saved for review",

        sale,
      });
    } catch (error) {
      console.error(
        "Create sale error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// EDIT PENDING SALE
// ==========================================

router.put(
  "/sales/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const saleId = req.params.id;

      const {
        productId,
        customerName,
        quantity,
        sellingPrice,
        saleDate,
        notes,
      } = req.body;

      // ==========================================
      // VALIDATE SALE ID
      // ==========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          saleId
        )
      ) {
        return res.status(400).json({
          message: "Invalid sale ID",
        });
      }

      // ==========================================
      // FIND SALE
      // ==========================================

      const sale =
        await Sale.findById(saleId);

      if (!sale) {
        return res.status(404).json({
          message: "Sale not found",
        });
      }

      // ==========================================
      // ONLY PENDING SALES CAN BE EDITED
      // ==========================================

      if (sale.status !== "pending") {
        return res.status(400).json({
          message:
            "Completed sales cannot be edited",
        });
      }

      // ==========================================
      // REQUIRED VALIDATION
      // ==========================================

      if (
        !productId ||
        quantity === undefined ||
        sellingPrice === undefined
      ) {
        return res.status(400).json({
          message:
            "Product, quantity and selling price are required",
        });
      }

      // ==========================================
      // VALIDATE PRODUCT ID
      // ==========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return res.status(400).json({
          message: "Invalid product ID",
        });
      }

      // ==========================================
      // VALIDATE QUANTITY
      // ==========================================

      if (
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a positive whole number",
        });
      }

      // ==========================================
      // VALIDATE PRICE
      // ==========================================

      if (
        Number.isNaN(Number(sellingPrice)) ||
        Number(sellingPrice) < 0
      ) {
        return res.status(400).json({
          message:
            "Selling price must be a valid number",
        });
      }

      // ==========================================
      // CUSTOMER VALIDATION
      // ==========================================

      if (
        customerName &&
        (
          typeof customerName !== "string" ||
          customerName.trim().length > 100
        )
      ) {
        return res.status(400).json({
          message:
            "Customer name must be 100 characters or fewer",
        });
      }

      // ==========================================
      // NOTES VALIDATION
      // ==========================================

      if (
        notes &&
        (
          typeof notes !== "string" ||
          notes.trim().length > 500
        )
      ) {
        return res.status(400).json({
          message:
            "Notes must be 500 characters or fewer",
        });
      }

      // ==========================================
      // DATE VALIDATION
      // ==========================================

      if (
        saleDate &&
        Number.isNaN(Date.parse(saleDate))
      ) {
        return res.status(400).json({
          message: "Sale date is invalid",
        });
      }

      // ==========================================
      // FIND NEW PRODUCT
      // ==========================================

      const product =
        await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // ==========================================
      // CHECK STOCK
      //
      // Since pending sale hasn't reduced stock,
      // we check the full current stock.
      // ==========================================

      if (
        Number(product.quantity) <
        Number(quantity)
      ) {
        return res.status(400).json({
          message: `Insufficient stock. Available stock: ${product.quantity}`,
        });
      }

      // ==========================================
      // RECALCULATE
      // ==========================================

      const quantityNumber =
        Number(quantity);

      const sellingPriceNumber =
        Number(sellingPrice);

      const costPriceNumber =
        Number(product.costPrice);

      const totalAmount =
        quantityNumber *
        sellingPriceNumber;

      const totalCost =
        quantityNumber *
        costPriceNumber;

      const profit =
        totalAmount -
        totalCost;

      // ==========================================
      // UPDATE SALE
      // ==========================================

      sale.product =
        product._id;

      sale.customerName =
        customerName &&
        customerName.trim()
          ? customerName.trim()
          : "Walk-in Customer";

      sale.quantity =
        quantityNumber;

      sale.sellingPrice =
        sellingPriceNumber;

      sale.totalAmount =
        totalAmount;

      sale.costPrice =
        costPriceNumber;

      sale.profit =
        profit;

      sale.saleDate =
        saleDate || sale.saleDate;

      sale.notes =
        notes
          ? notes.trim()
          : "";

      await sale.save();

      // Populate product
      await sale.populate(
        "product",
        "name sku category"
      );

      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(200).json({
        message:
          "Sale updated successfully",

        sale,
      });
    } catch (error) {
      console.error(
        "Update sale error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// FINALIZE SALE
// ==========================================

router.post(
  "/sales/:id/finalize",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const saleId = req.params.id;

      // ==========================================
      // VALIDATE ID
      // ==========================================

      if (
        !mongoose.Types.ObjectId.isValid(
          saleId
        )
      ) {
        return res.status(400).json({
          message: "Invalid sale ID",
        });
      }

      // ==========================================
      // FIND SALE
      // ==========================================

      const sale =
        await Sale.findById(saleId);

      if (!sale) {
        return res.status(404).json({
          message: "Sale not found",
        });
      }

      // ==========================================
      // CHECK STATUS
      // ==========================================

      if (sale.status === "completed") {
        return res.status(400).json({
          message:
            "Sale has already been completed",
        });
      }

      // ==========================================
      // ATOMICALLY REDUCE STOCK
      //
      // This protects against two users
      // selling the same stock.
      // ==========================================

      const product =
        await Product.findOneAndUpdate(
          {
            _id: sale.product,

            quantity: {
              $gte: sale.quantity,
            },
          },
          {
            $inc: {
              quantity: -sale.quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!product) {
        return res.status(409).json({
          message:
            "Insufficient stock. Stock may have changed while reviewing this invoice.",
        });
      }

      // ==========================================
      // MARK SALE COMPLETED
      // ==========================================

      sale.status = "completed";

      await sale.save();

      // Populate product
      await sale.populate(
        "product",
        "name sku category"
      );

      // ==========================================
      // RESPONSE
      // ==========================================

      return res.status(200).json({
        message:
          "Sale completed successfully",

        sale,

        product,
      });
    } catch (error) {
      console.error(
        "Finalize sale error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// GET COMPLETED SALES
// ==========================================

router.get(
  "/sales",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const sales =
        await Sale.find({
          status: "completed",
        })
          .populate(
            "product",
            "name sku category"
          )
          .sort({
            saleDate: -1,
            createdAt: -1,
          });

      return res.status(200).json({
        sales,
      });
    } catch (error) {
      console.error(
        "Get sales error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;