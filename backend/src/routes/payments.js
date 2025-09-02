// backend/src/routes/payment.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { createOrder, captureOrder } from "../controllers/paymentController.js";
import paypal from "@paypal/checkout-server-sdk";
import client from "../config/paypal.js";

const r = express.Router();

// Student creates order
r.post("/order", requireAuth(["student"]), createOrder);

// Student captures payment (if needed)
r.post("/capture/:orderId", requireAuth(["student"]), captureOrder);

// ✅ Success callback (PayPal return_url)
r.get("/success", async (req, res) => {
  const { token } = req.query; // PayPal orderId
  if (!token) return res.status(400).send("Missing token");

  try {
    const reqCap = new paypal.orders.OrdersCaptureRequest(token);
    reqCap.requestBody({});
    const capture = await client.execute(reqCap);

    // TODO: Update DB fee status = "paid" using token
    // Example:
    // await Application.findOneAndUpdate(
    //   { "fee.orderId": token },
    //   { "fee.status": "paid", "fee.paymentId": capture.result.id }
    // );

    return res.redirect("http://localhost:5173/payment/success"); // 👈 frontend success page
  } catch (err) {
    console.error("PayPal Success Error:", err);
    return res.redirect("http://localhost:5173/payment/failed");
  }
});

// ❌ Cancel callback (PayPal cancel_url)
r.get("/cancel", (req, res) => {
  return res.redirect("http://localhost:5173/payment/cancelled");
});

export default r;
