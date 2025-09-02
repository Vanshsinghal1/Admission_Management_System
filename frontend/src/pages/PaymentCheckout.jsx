// src/pages/PaymentCheckout.jsx
import { api, USE_MOCK } from "../lib/api";
import { useEffect, useRef, useState } from "react";
import { loadPayPal } from "../utils/loadPayPal";

const feesByBranch = {
  "B.Tech CSE": 13.0,
  "B.Tech IT": 12.0,
  "B.Tech ECE": 12.0,
  BBA: 90.0,
  MBA: 15.0,
};

export default function PaymentCheckout() {
  const [branch, setBranch] = useState("");
  const [amount, setAmount] = useState(0);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [appMeta, setAppMeta] = useState(null);
  const paypalRef = useRef(null);

  // 1) Auth check
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/auth/me");
        setUserInfo(res.data || {});
      } catch {
        setError("Please login first to make payment");
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // 2) Load current user's application meta
  useEffect(() => {
    (async () => {
      try {
        if (!authChecked) return;
        if (!userInfo) return;
        const { data } = await api.get("/applications/me");
        setAppMeta(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [authChecked, userInfo]);

  const isPaymentEnabled = !!appMeta?.fee?.isPaymentEnabled;

  // 3) Branch change => amount + reset PayPal button
  useEffect(() => {
    setAmount(feesByBranch[branch] || 0);
    setPaypalLoaded(false);
    setError("");
    if (paypalRef.current) paypalRef.current.innerHTML = "";
  }, [branch]);

  // 4) Load PayPal button (only if enabled)
  useEffect(() => {
    if (!isPaymentEnabled) return;
    if (USE_MOCK || amount <= 0 || !authChecked || !userInfo) return;
    if (paypalLoaded) return;

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setError("PayPal configuration missing");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError("");

        await loadPayPal(clientId, "USD");
        if (!window.paypal) throw new Error("PayPal SDK failed to load!");

        setPaypalLoaded(true);
        if (paypalRef.current) paypalRef.current.innerHTML = "";

        window.paypal
          .Buttons({
            createOrder: async () => {
              try {
                // ✅ backend endpoint: /api/payments/order
                const { data } = await api.post("/payments/order", {
                  amount,
                  applicationId: "me",
                  branch,
                });
                return data.id;
              } catch (err) {
                if (err.response) {
                  if (err.response.status === 403) {
                    setError(err.response.data?.message || "Payment not enabled yet");
                    alert("Payment is not enabled by admin yet.");
                  } else if (err.response.status === 404) {
                    setError(err.response.data?.message || "Application not found");
                  } else if (err.response.status === 401) {
                    setError("Please login again to make payment.");
                  } else {
                    setError(err.response.data?.message || "Payment failed");
                  }
                } else if (err.request) {
                  setError("Cannot connect to payment server. Is backend running?");
                } else {
                  setError(err.message || "Payment setup failed");
                }
                throw err;
              }
            },

            onApprove: async (data) => {
              try {
                // ✅ backend endpoint: /api/payments/capture/:orderId
                await api.post(`/payments/capture/${data.orderID}`, {
                  applicationId: "me",
                });
                alert("✅ Payment successful & verified!");
                setTimeout(() => window.location.replace("/application/status"), 1200);
              } catch (err) {
                const msg = err.response?.data?.message || "Payment verification failed";
                setError(msg);
                alert(`❌ ${msg}`);
              }
            },

            onError: (err) => {
              console.error("❌ PayPal Button Error:", err);
              setError("PayPal payment failed. Please try again.");
            },

            onCancel: () => {
              console.log("⚠️ Payment cancelled by user");
              alert("Payment cancelled");
            },
          })
          .render(paypalRef.current);
      } catch (err) {
        console.error("❌ PayPal setup error:", err);
        setError(`PayPal setup failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [amount, paypalLoaded, authChecked, userInfo, branch, isPaymentEnabled]);

  // UI
  if (authChecked && !userInfo) {
    return (
      <div className="max-w-md mx-auto card p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please login to your student account to make payment.</p>
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-4">Application Fee Payment</h1>

      {userInfo && (
        <div className="mb-4 p-3 bg-green-50 rounded">
          <p className="text-sm text-green-700">✅ Logged in</p>
        </div>
      )}

      {!isPaymentEnabled && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
          Your application is under review. Payment will be enabled by admin after document verification.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <label className="label">Select Course/Branch</label>
        <select
          className="input"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="">-- Select Branch --</option>
          {Object.keys(feesByBranch).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="label">Amount (USD)</label>
        <input className="input" type="number" value={amount} readOnly />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading PayPal...</p>
        </div>
      )}

      {/* Render PayPal button only if enabled */}
      {isPaymentEnabled && amount > 0 && !error && <div className="mt-4" ref={paypalRef}></div>}
    </div>
  );
}
