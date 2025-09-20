// frontend/src/pages/ApplicationStatus.jsx
import { useEffect, useState } from "react";
import { api, USE_MOCK } from "../lib/api";
import { mockMeApplication } from "../lib/mock";
import FormDataTable from "../components/FormDataTable";

export default function ApplicationStatus() {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      if (USE_MOCK) {
        const a = await mockMeApplication();
        setApp(a);
      } else {
        const { data } = await api.get("/applications/me");
        setApp(data);
      }
    } catch (e) {
      console.error(e);
      setErr("Failed to load application. Please try again.");
      setApp(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

  if (!app)
    return (
      <div className="card p-6 text-center">
        {err ? (
          <p className="text-sm text-red-600">{err}</p>
        ) : (
          <p className="text-sm text-gray-600">
            No application found.{" "}
            <a className="text-brand-700 underline font-medium" href="/apply">
              Apply Now
            </a>.
          </p>
        )}
      </div>
    );

  // badge styling
  const badge = (status) => {
    if (status === "paid" || status === "approved")
      return "bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-full text-xs font-medium";
    if (status === "under-review" || status === "submitted")
      return "bg-yellow-100 text-yellow-700 border border-yellow-300 px-3 py-1 rounded-full text-xs font-medium";
    return "bg-red-100 text-red-700 border border-red-300 px-3 py-1 rounded-full text-xs font-medium";
  };

  // 🔒 trust single source of truth from backend
  const isPaymentEnabled = app?.fee?.isPaymentEnabled === true;
  const paymentDisabled = !isPaymentEnabled;
  const alreadyPaid = app?.fee?.status === "paid";

  const handlePayment = () => {
    if (!isPaymentEnabled) {
      alert("Your application is under review. Admin will enable payment after document verification.");
      return;
    }
    window.location.href = "http://localhost:5173/payment/checkout";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="card p-6 shadow-md rounded-xl border border-gray-200 bg-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Application Review</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your submitted application details and current status below.
            </p>
          </div>
          <button
            onClick={load}
            className="text-sm px-3 py-1 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50"
            title="Reload latest status"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Application ID:</span>{" "}
            {app.id || app._id || "—"}
          </p>
          <span className={badge(app.status)}>{app.status || "draft"}</span>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <FormDataTable title="Personal Details" data={app.personal} />
        <FormDataTable title="Academic Details" data={app.academic} />
        <FormDataTable title="Program Details" data={app.program} />
        <FormDataTable
          title="Fee Status"
          data={{
            ...(app.fee || { status: "unpaid" }),
            isPaymentEnabled: isPaymentEnabled ? "Yes" : "No",
          }}
        />
      </div>

      {/* Payment Button Section */}
      <div className="card p-6 shadow-md rounded-xl border border-gray-200 bg-white text-center">
        {alreadyPaid ? (
          <p className="text-green-600 font-medium">✅ Fees Already Paid</p>
        ) : (
          <>
            {paymentDisabled && (
              <div className="mb-3 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                Your application is under review. Payment will be enabled by admin after document verification.
              </div>
            )}
            <button
              onClick={handlePayment}
              disabled={paymentDisabled}
              className={`px-6 py-2 rounded-lg shadow-md transition text-white font-medium ${
                paymentDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-brand-600 hover:bg-brand-700"
              }`}
              title={paymentDisabled ? "Payment is disabled until admin verification" : "Proceed to pay"}
            >
              Pay Fees
            </button>
          </>
        )}
      </div>
    </div>
  );
}
