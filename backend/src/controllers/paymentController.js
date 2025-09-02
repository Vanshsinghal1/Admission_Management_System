// backend/src/controllers/paymentController.js
import paypal from "@paypal/checkout-server-sdk";
import Application from "../models/Application.js";
import client from "../config/paypal.js";

export const createOrder = async (req, res) => {
  const { applicationId, amount, branch } = req.body;

  try {
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // ✅ Check user from JWT
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    let app;
    if (applicationId === "me") {
      app = await Application.findOne({ user: userId });

      // Auto-create draft if not found
      if (!app) {
        app = new Application({
          user: userId,
          status: "draft",
          program: {
            course: branch || "pending",
            branch: branch || "pending",
          },
          fee: { amount: 0, currency: "USD", status: "unpaid", isPaymentEnabled: false },
        });
        await app.save();
      }
    } else {
      app = await Application.findById(applicationId);
    }

    if (!app) return res.status(404).json({ message: "Application not found" });

    // ✅ GATE: admin must enable payment
    if (!app.fee?.isPaymentEnabled) {
      return res.status(403).json({ message: "Payment not enabled by admin yet" });
    }

    // ✅ Update branch if given
    if (branch) {
      app.program = app.program || {};
      app.program.branch = branch;
      if (!app.program.course) app.program.course = branch;
      await app.save();
    }

    // ✅ PayPal create order
    const reqCreate = new paypal.orders.OrdersCreateRequest();
    reqCreate.prefer("return=representation");
    reqCreate.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: String(app._id),
          amount: {
            currency_code: "USD",
            value: Number(amount).toFixed(2).toString(),
          },
          description: "Application fee payment",
        },
      ],
      application_context: {
        brand_name: "College Admission System",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        // 👇 PayPal ke return/cancel redirect URLs
        return_url: "http://localhost:5000/payment/success",
        cancel_url: "http://localhost:5000/payment/cancel",
      },
    });

    const order = await client.execute(reqCreate);

    // Save order in DB
    app.fee = {
      ...(app.fee || {}),
      amount: Number(amount),
      currency: "USD",
      status: "processing",
      orderId: order.result.id,
    };
    await app.save();

    return res.json({ id: order.result.id, links: order.result.links });
  } catch (err) {
    console.error("❌ Create Order Error:", err);
    if (err?.response) {
      console.error("PayPal API error:", JSON.stringify(err.response, null, 2));
    }
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
};

export const captureOrder = async (req, res) => {
  const { applicationId } = req.body;

  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthenticated" });

    const app =
      applicationId === "me"
        ? await Application.findOne({ user: userId })
        : await Application.findById(applicationId);

    if (!app) return res.status(404).json({ message: "Application not found" });

    const reqCap = new paypal.orders.OrdersCaptureRequest(req.params.orderId);
    reqCap.requestBody({});
    const capture = await client.execute(reqCap);

    // ✅ Update DB after successful payment
    app.fee.status = "paid";
    app.fee.paymentId = capture.result.id;
    app.status = "under-review";
    await app.save();

    return res.json({ message: "Payment verified", details: capture.result });
  } catch (err) {
    console.error("❌ Capture Order Error:", err);
    if (err?.response) {
      console.error("PayPal API error:", JSON.stringify(err.response, null, 2));
    }
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
};
