const express = require("express");
const Razorpay = require("razorpay");
const bodyParser = require("body-parser");
const mysql = require('mysql2');
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MySQL Database Setup
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ruma@123#",
    database: "payments_db",
});

db.connect((err) => {
    if (err) throw err;
    console.log("Database connected!");
});

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: "rzp_test_Xs3a4j0VXZSOV9",
    key_secret: "ojy4ncu8GYZSEVqjig6yLghb",
});

// Create Order Endpoint
app.post("/create-order", (req, res) => {
    const { amount, currency } = req.body;

    const options = {
        amount: amount * 100, // Amount in smallest currency unit (paise for INR)
        currency: currency,
        receipt: `receipt_${Date.now()}`,
    };

    razorpay.orders.create(options, (err, order) => {
        if (err) return res.status(500).json({ error: err });
        res.json(order);
    });
});

// Save Payment Info
app.post("/save-payment", (req, res) => {
    const { orderId, paymentId, signature } = req.body;

    const sql = "INSERT INTO payments (order_id, payment_id, signature) VALUES (?, ?, ?)";
    db.query(sql, [orderId, paymentId, signature], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Payment saved successfully!" });
    });
});

const PORT = 4400;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
