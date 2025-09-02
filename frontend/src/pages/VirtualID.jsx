import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function VirtualID() {
  const [app, setApp] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/applications/me");
        setApp(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (!app) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Virtual Student ID</h1>

      {app.fee?.status === "paid" ? (
        <div className="mt-4">
          <p className="mb-2 text-sm">✅ Fees paid. Your Virtual ID is ready.</p>
          <a
            className="btn-outline"
            href={`${
              import.meta.env.VITE_API_URL || "http://localhost:5000/api"
            }/id/${app._id}.pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Open PDF
          </a>
        </div>
      ) : (
        <p className="text-red-600 text-sm mt-2">
          ❌ Pay your application fees to generate Virtual ID.
        </p>
      )}
    </div>
  );
}
