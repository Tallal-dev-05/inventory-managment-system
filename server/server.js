const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const itemRoutes = require("./routes/itemRoutes");
const customerRoutes = require("./routes/customerRoutes");

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header include same-origin tools such as curl.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api", purchaseRoutes);
app.use("/api", saleRoutes);
app.use("/api", itemRoutes);
app.use("/api", customerRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { family: 4 })
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
