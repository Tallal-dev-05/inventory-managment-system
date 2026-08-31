const express = require("express");
const mongoose = require("mongoose");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const CustomerTransaction = require("../models/CustomerTransaction");

const router = express.Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveCustomer(customerId, customerName) {
  if (!customerId) {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    const error = new Error("Invalid customer ID");
    error.statusCode = 400;
    throw error;
  }

  const customer = await Customer.findById(customerId);

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return customer;
}

router.get(
  "/sales/customer-balance",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const customerName =
        typeof req.query.customerName === "string"
          ? req.query.customerName.trim()
          : "";

      if (!customerName || customerName.toLowerCase() === "walk-in customer") {
        return res.status(200).json({ balance: 0 });
      }

      const customer = await Customer.findOne({
        name: { $regex: `^${escapeRegex(customerName)}$`, $options: "i" },
      });

      return res.status(200).json({ balance: Number(customer?.balance || 0) });
    } catch (error) {
      console.error("Get customer balance error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

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
        customerId,
        customerName,
        amountPaid,
        quantity,
        sellingPrice,
        saleDate,
        notes,
      } = req.body;

      // ======================================
      // REQUIRED FIELDS
      // ======================================

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

      // ======================================
      // PRODUCT ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid product ID",
        });
      }

      // ======================================
      // CUSTOMER ID
      // ======================================

      let customer = null;
      let previousBalance = 0;

      customer = await resolveCustomer(customerId, customerName);

      if (customer) {
        previousBalance =
          Number(
            customer.balance || 0
          );
      }

      // ======================================
      // QUANTITY
      // ======================================

      if (
        !Number.isInteger(
          Number(quantity)
        ) ||
        Number(quantity) <= 0
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a positive whole number",
        });
      }

      // ======================================
      // SELLING PRICE
      // ======================================

      if (
        Number.isNaN(
          Number(sellingPrice)
        ) ||
        Number(sellingPrice) < 0
      ) {
        return res.status(400).json({
          message:
            "Selling price must be a valid number",
        });
      }

      // ======================================
      // FIND PRODUCT
      // ======================================

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      // ======================================
      // STOCK
      // ======================================

      if (
        Number(product.quantity) <
        Number(quantity)
      ) {
        return res.status(400).json({
          message:
            `Insufficient stock. Available stock: ${product.quantity}`,
        });
      }

      // ======================================
      // CALCULATE SALE
      // ======================================

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

      // ======================================
      // AMOUNT PAID
      // ======================================

      const amountPaidNumber =
        Number(amountPaid || 0);

      if (
        Number.isNaN(
          amountPaidNumber
        ) ||
        amountPaidNumber < 0
      ) {
        return res.status(400).json({
          message:
            "Amount paid must be a valid number",
        });
      }

      // ======================================
      // TOTAL DUE
      //
      // Previous customer debt
      // +
      // New sale
      // ======================================

      const totalDue =
        previousBalance +
        totalAmount;

      // ======================================
      // PREVENT OVERPAYMENT
      // ======================================

      if (
        amountPaidNumber >
        totalDue
      ) {
        return res.status(400).json({
          message:
            `Amount paid cannot exceed total due of ${totalDue}`,
        });
      }

      if (
        customerName !== undefined &&
        (typeof customerName !== "string" || customerName.trim().length > 100)
      ) {
        return res.status(400).json({
          message: "Customer name must be 100 characters or fewer",
        });
      }

      if (
        notes !== undefined &&
        (typeof notes !== "string" || notes.trim().length > 500)
      ) {
        return res.status(400).json({
          message: "Notes must be 500 characters or fewer",
        });
      }

      if (saleDate && Number.isNaN(Date.parse(saleDate))) {
        return res.status(400).json({ message: "Sale date is invalid" });
      }

      if (!customer && amountPaidNumber !== totalAmount) {
        return res.status(400).json({
          message: "Walk-in customers must pay the full sale amount",
        });
      }

      // ======================================
      // REMAINING BALANCE
      // ======================================

      const remainingBalance =
        totalDue -
        amountPaidNumber;

      // ======================================
      // CREATE PENDING SALE
      // ======================================

      const sale =
        await Sale.create({
          product:
            product._id,

          customer:
            customer
              ? customer._id
              : null,

          customerName:
            customer
              ? customer.name
              : (
                  customerName &&
                  customerName.trim()
                    ? customerName.trim()
                    : "Walk-in Customer"
                ),

          amountPaid:
            amountPaidNumber,

          previousBalance,

          remainingBalance,

          quantity:
            quantityNumber,

          sellingPrice:
            sellingPriceNumber,

          totalAmount,

          costPrice:
            costPriceNumber,

          profit,

          saleDate:
            saleDate ||
            new Date(),

          notes:
            notes
              ? notes.trim()
              : "",

          status:
            "pending",
        });

      // ======================================
      // POPULATE PRODUCT
      // ======================================

      await sale.populate(
        "product",
        "name sku category"
      );

      // ======================================
      // POPULATE CUSTOMER
      // ======================================

      await sale.populate(
        "customer",
        "name phone balance"
      );

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

      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({
        message:
          "Server error",
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
      const saleId =
        req.params.id;

      const {
        productId,
        customerId,
        customerName,
        amountPaid,
        quantity,
        sellingPrice,
        saleDate,
        notes,
      } = req.body;

      // ======================================
      // SALE ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          saleId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid sale ID",
        });
      }

      // ======================================
      // FIND SALE
      // ======================================

      const sale =
        await Sale.findById(
          saleId
        );

      if (!sale) {
        return res.status(404).json({
          message:
            "Sale not found",
        });
      }

      // ======================================
      // ONLY PENDING
      // ======================================

      if (
        sale.status !==
        "pending"
      ) {
        return res.status(400).json({
          message:
            "Completed sales cannot be edited",
        });
      }

      // ======================================
      // REQUIRED
      // ======================================

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

      // ======================================
      // PRODUCT ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid product ID",
        });
      }

      // ======================================
      // QUANTITY
      // ======================================

      if (
        !Number.isInteger(
          Number(quantity)
        ) ||
        Number(quantity) <= 0
      ) {
        return res.status(400).json({
          message:
            "Quantity must be a positive whole number",
        });
      }

      // ======================================
      // SELLING PRICE
      // ======================================

      if (
        Number.isNaN(
          Number(sellingPrice)
        ) ||
        Number(sellingPrice) < 0
      ) {
        return res.status(400).json({
          message:
            "Selling price must be a valid number",
        });
      }

      // ======================================
      // FIND PRODUCT
      // ======================================

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          message:
            "Product not found",
        });
      }

      // ======================================
      // STOCK
      // ======================================

      if (
        Number(product.quantity) <
        Number(quantity)
      ) {
        return res.status(400).json({
          message:
            `Insufficient stock. Available stock: ${product.quantity}`,
        });
      }

      // ======================================
      // CUSTOMER
      // ======================================

      let customer = null;
      let previousBalance = 0;

      customer = await resolveCustomer(customerId, customerName);

      if (customer) {
        previousBalance =
          Number(
            customer.balance || 0
          );
      }

      // ======================================
      // CALCULATE
      // ======================================

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

      // ======================================
      // PAYMENT
      // ======================================

      const amountPaidNumber =
        Number(amountPaid || 0);

      if (
        Number.isNaN(
          amountPaidNumber
        ) ||
        amountPaidNumber < 0
      ) {
        return res.status(400).json({
          message:
            "Amount paid must be a valid number",
        });
      }

      const totalDue =
        previousBalance +
        totalAmount;

      if (
        amountPaidNumber >
        totalDue
      ) {
        return res.status(400).json({
          message:
            `Amount paid cannot exceed total due of ${totalDue}`,
        });
      }

      if (
        customerName !== undefined &&
        (typeof customerName !== "string" || customerName.trim().length > 100)
      ) {
        return res.status(400).json({
          message: "Customer name must be 100 characters or fewer",
        });
      }

      if (
        notes !== undefined &&
        (typeof notes !== "string" || notes.trim().length > 500)
      ) {
        return res.status(400).json({
          message: "Notes must be 500 characters or fewer",
        });
      }

      if (saleDate && Number.isNaN(Date.parse(saleDate))) {
        return res.status(400).json({ message: "Sale date is invalid" });
      }

      if (!customer && amountPaidNumber !== totalAmount) {
        return res.status(400).json({
          message: "Walk-in customers must pay the full sale amount",
        });
      }

      const remainingBalance =
        totalDue -
        amountPaidNumber;

      // ======================================
      // UPDATE SALE
      // ======================================

      sale.product =
        product._id;

      sale.customer =
        customer
          ? customer._id
          : null;

      sale.customerName =
        customer
          ? customer.name
          : (
              customerName &&
              customerName.trim()
                ? customerName.trim()
                : "Walk-in Customer"
            );

      sale.amountPaid =
        amountPaidNumber;

      sale.previousBalance =
        previousBalance;

      sale.remainingBalance =
        remainingBalance;

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
        saleDate ||
        sale.saleDate;

      sale.notes =
        notes
          ? notes.trim()
          : "";

      await sale.save();

      // ======================================
      // POPULATE
      // ======================================

      await sale.populate(
        "product",
        "name sku category"
      );

      await sale.populate(
        "customer",
        "name phone balance"
      );

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

      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({
        message:
          "Server error",
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
    const session =
      await mongoose.startSession();

    try {
      const saleId =
        req.params.id;

      // ======================================
      // VALIDATE ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          saleId
        )
      ) {
        await session.endSession();

        return res.status(400).json({
          message:
            "Invalid sale ID",
        });
      }

      let finalSale;
      let updatedProduct;

      await session.withTransaction(
        async () => {
          // ==================================
          // FIND SALE
          // ==================================

          const sale =
            await Sale.findById(
              saleId
            ).session(session);

          if (!sale) {
            throw new Error(
              "Sale not found"
            );
          }

          // ==================================
          // CHECK STATUS
          // ==================================

          if (
            sale.status ===
            "completed"
          ) {
            throw new Error(
              "Sale has already been completed"
            );
          }

          // ==================================
          // REDUCE STOCK ATOMICALLY
          // ==================================

          const product =
            await Product.findOneAndUpdate(
              {
                _id: sale.product,

                quantity: {
                  $gte:
                    sale.quantity,
                },
              },
              {
                $inc: {
                  quantity:
                    -sale.quantity,
                },
              },
              {
                new: true,
                session,
              }
            );

          if (!product) {
            throw new Error(
              "Insufficient stock. Stock may have changed while reviewing this invoice."
            );
          }

          updatedProduct =
            product;

          // ==================================
          // CUSTOMER BALANCE
          // ==================================

          if (sale.customer) {
            const customer =
              await Customer.findById(
                sale.customer
              ).session(session);

            if (!customer) {
              throw new Error(
                "Customer associated with this sale was not found"
              );
            }

            // Current balance is used here
            // because something could have
            // changed while invoice was pending.

            const previousBalance =
              Number(
                customer.balance ||
                  0
              );

            const totalDue =
              previousBalance +
              Number(
                sale.totalAmount
              );

            const amountPaid =
              Number(
                sale.amountPaid ||
                  0
              );

            if (
              amountPaid >
              totalDue
            ) {
              throw new Error(
                "Amount paid exceeds customer balance and sale amount"
              );
            }

            const newBalance =
              totalDue -
              amountPaid;

            // ==============================
            // UPDATE CUSTOMER
            // ==============================

            customer.balance =
              newBalance;

            await customer.save({
              session,
            });

            // ==============================
            // UPDATE SALE BALANCE
            // ==============================

            sale.previousBalance =
              previousBalance;

            sale.remainingBalance =
              newBalance;

            // ==============================
            // CREATE LEDGER ENTRY
            // ==============================

            await CustomerTransaction.create(
              [
                {
                  customer:
                    customer._id,

                  type: "sale",

                  sale:
                    sale._id,

                  amount:
                    Number(
                      sale.totalAmount
                    ),

                  previousBalance,

                  balanceAfter:
                    newBalance,

                  description:
                    "Product sale",
                },
              ],
              {
                session,
              }
            );
          }

          // ==================================
          // COMPLETE SALE
          // ==================================

          sale.status =
            "completed";

          await sale.save({
            session,
          });

          finalSale =
            sale;
        }
      );

      await session.endSession();

      // ======================================
      // POPULATE AFTER TRANSACTION
      // ======================================

      await finalSale.populate(
        "product",
        "name sku category"
      );

      await finalSale.populate(
        "customer",
        "name phone balance"
      );

      return res.status(200).json({
        message:
          "Sale completed successfully",

        sale:
          finalSale,

        product:
          updatedProduct,
      });
    } catch (error) {
      await session.endSession();

      console.error(
        "Finalize sale error:",
        error
      );

      const message =
        error.message ||
        "Server error";

      if (
        message ===
        "Sale not found"
      ) {
        return res.status(404).json({
          message,
        });
      }

      if (
        message ===
        "Sale has already been completed"
      ) {
        return res.status(400).json({
          message,
        });
      }

      if (
        message.includes(
          "Insufficient stock"
        )
      ) {
        return res.status(409).json({
          message,
        });
      }

      if (
        message.includes(
          "Customer"
        )
      ) {
        return res.status(404).json({
          message,
        });
      }

      return res.status(500).json({
        message:
          "Failed to finalize sale",
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
          .populate(
            "customer",
            "name phone balance"
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
        message:
          "Server error",
      });
    }
  }
);

module.exports = router;
