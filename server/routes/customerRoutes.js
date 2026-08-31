const express = require("express");
const mongoose = require("mongoose");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");

const Customer = require("../models/Customer");
const CustomerTransaction = require("../models/CustomerTransaction");

const router = express.Router();

// ==========================================
// GET ALL CUSTOMERS
// ==========================================

router.get(
  "/customers",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const customers =
        await Customer.find().sort({
          name: 1,
        });

      return res.status(200).json({
        customers,
      });
    } catch (error) {
      console.error(
        "Get customers error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// CREATE CUSTOMER
// ==========================================

router.post(
  "/customers",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { name, phone } = req.body;

      if (
        !name ||
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          message:
            "Customer name is required",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          message:
            "Customer name must be 100 characters or fewer",
        });
      }

      if (
        phone &&
        (
          typeof phone !== "string" ||
          phone.trim().length > 30
        )
      ) {
        return res.status(400).json({
          message:
            "Phone number must be 30 characters or fewer",
        });
      }

      const customer =
        await Customer.create({
          name: name.trim(),
          phone: phone
            ? phone.trim()
            : "",
          balance: 0,
        });

      return res.status(201).json({
        message:
          "Customer created successfully",
        customer,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "A customer with this name already exists",
        });
      }

      console.error(
        "Create customer error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// GET SINGLE CUSTOMER
// ==========================================

router.get(
  "/customers/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const customerId =
        req.params.id;

      if (
        !mongoose.Types.ObjectId.isValid(
          customerId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid customer ID",
        });
      }

      const customer = await Customer.findById(customerId);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      return res.status(200).json({ customer });
    } catch (error) {
      console.error(
        "Get customer error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// RECEIVE PAYMENT FROM CUSTOMER
// ==========================================

router.post(
  "/customers/:id/payment",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const session = await mongoose.startSession();

    try {
      const customerId =
        req.params.id;

      const {
        amount,
        notes,
      } = req.body;

      // ======================================
      // VALIDATE CUSTOMER ID
      // ======================================

      if (
        !mongoose.Types.ObjectId.isValid(
          customerId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid customer ID",
        });
      }

      // ======================================
      // VALIDATE PAYMENT
      // ======================================

      const paymentAmount =
        Number(amount);

      if (
        Number.isNaN(paymentAmount) ||
        paymentAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Payment amount must be greater than zero",
        });
      }

      let customer;
      let transaction;

      await session.withTransaction(async () => {
        customer = await Customer.findById(customerId).session(session);

        if (!customer) {
          const error = new Error("Customer not found");
          error.statusCode = 404;
          throw error;
        }

        const previousBalance = Number(customer.balance || 0);

        if (paymentAmount > previousBalance) {
          const error = new Error(
            `Payment cannot exceed outstanding balance of ${previousBalance}`
          );
          error.statusCode = 400;
          throw error;
        }

        const newBalance = previousBalance - paymentAmount;
        customer.balance = newBalance;
        await customer.save({ session });

        [transaction] = await CustomerTransaction.create(
          [{
            customer: customer._id,
            type: "payment",
            sale: null,
            amount: paymentAmount,
            previousBalance,
            balanceAfter: newBalance,
            description: typeof notes === "string" && notes.trim()
              ? notes.trim()
              : "Payment received",
          }],
          { session }
        );
      });

      await session.endSession();

      return res.status(200).json({
        message:
          "Payment recorded successfully",

        customer,

        transaction,
      });
    } catch (error) {
      await session.endSession();
      console.error(
        "Receive payment error:",
        error
      );

      if (error.statusCode) {
        return res.status(error.statusCode).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ==========================================
// GET CUSTOMER TRANSACTION HISTORY
// ==========================================

router.get(
  "/customers/:id/transactions",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const customerId =
        req.params.id;

      if (
        !mongoose.Types.ObjectId.isValid(
          customerId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid customer ID",
        });
      }

      const customer =
        await Customer.findById(
          customerId
        );

      if (!customer) {
        return res.status(404).json({
          message:
            "Customer not found",
        });
      }

      const transactions =
        await CustomerTransaction.find({
          customer:
            customerId,
        })
          .populate(
            "sale",
            "totalAmount amountPaid saleDate"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        customer,
        transactions,
      });
    } catch (error) {
      console.error(
        "Get customer transactions error:",
        error
      );

      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;
