const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function validateSignup({ name, email, password } = {}) {
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = normalizeEmail(email);

  if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(normalizedName) || normalizedName.length > 50) {
    return { message: "Enter a valid name" };
  }
  if (normalizedEmail.length > 254 || !emailPattern.test(normalizedEmail)) {
    return { message: "Enter a valid email address" };
  }
  if (typeof password !== "string" || !passwordPattern.test(password)) {
    return { message: "Password must be 8-64 characters and include uppercase, lowercase, number, and special character" };
  }

  return { name: normalizedName, email: normalizedEmail };
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000,
    path: "/",
  };
}

router.post("/signup", async (req, res) => {
  const validation = validateSignup(req.body);
  if (validation.message) return res.status(400).json({ message: validation.message });

  try {
    const existingUser = await User.findOne({ email: validation.email });
    if (existingUser) return res.status(409).json({ message: "Email is already registered" });

    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({
      name: validation.name,
      email: validation.email,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "Account created successfully", user: publicUser(user) });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error("Signup error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/signin", async (req, res) => {
  const { email: rawEmail, password } = req.body || {};
  const email = normalizeEmail(rawEmail);
  if (!email || !emailPattern.test(email) || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ message: "Server authentication is not configured" });
    }

    const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("auth_token", token, authCookieOptions());
    return res.status(200).json({ message: "Login successful", user: publicUser(user) });
  } catch (error) {
    console.error("Signin error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub).select("name email role");
    if (!user) return res.status(401).json({ message: "Authentication required" });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Session lookup error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return res.status(204).send();
});

module.exports = router;
