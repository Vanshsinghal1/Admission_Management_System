import { useEffect, useMemo, useState } from "react";
import { api, USE_MOCK } from "../lib/api";
import { mockAdminList } from "../lib/mock";
import { useAuth } from "../context/AuthContext";

// ✅ Fix Cloudinary URLs for PDFs
function fixCloudinaryDocUrl(url) {
  if (!url || typeof url !== "string") return url;
  if (!/res\.cloudinary\.com/.test(url)) return url;

  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) {
    // PDFs must be served via /raw/upload/
    return url.replace(/\/(image|video)\/upload\//, "/raw/upload/");
  }

  // images/videos remain unchanged
  return url;
}

export default function Admin() {
  const { user } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: "", status: "", course: "" });

  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  // ---- admin guard ----
  useEffect(() => {
    (async () => {
      try {
        let role = (user?.role || "").toString().toLowerCase();
        if (!role) {
          const me = await api.get("/auth/me");
          role = (me?.data?.role ?? me?.data?.user?.role ?? "")
            .toString()
            .toLowerCase();
        }
        if (role !== "admin") {
          window.location.replace("/admin/login");
          return;
        }
      } catch {
        window.location.replace("/admin/login");
        return;
      } finally {
        setAuthChecked(true);
      }
    })();
  }, [user]);

  // ---- load list ----
  const loadList = async () => {
    setLoading(true);
    setError("");
    try {
      if (USE_MOCK) {
        const data = await mockAdminList();
        setRows(data || []);
        if (!activeId && data?.length) setActiveId(data[0]._id || data[0].id);
      } else {
        const { data } = await api.get("/admin/applications", { params: filters });
        const arr = Array.isArray(data) ? data : [];
        setRows(arr);
        if (!activeId && arr.length) setActiveId(arr[0]._id);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authChecked) loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, filters.q, filters.status, filters.course]);

  // ---- load detail ----
  const loadDetail = async (id) => {
    if (!id) return;
    setLoadingDetail(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/applications/${id}`);
      setDetail(data || null);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load application");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (activeId) loadDetail(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // ---- actions ----
  const setStatus = async (status) => {
    try {
      await api.patch(`/admin/applications/${activeId}/status`, { status });
      await loadDetail(activeId);
      await loadList();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to update status");
    }
  };

  const togglePayment = async () => {
    try {
      const allowed = !(detail?.fee?.isPaymentEnabled);
      await api.patch(`/admin/applications/${activeId}/enable-payment`, { allowed });
      await loadDetail(activeId);
      await loadList();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to toggle payment");
    }
  };

  const updateDoc = async (idx, newStatus) => {
    try {
      await api.patch(`/admin/applications/${activeId}/docs/${idx}`, { status: newStatus });
      await loadDetail(activeId);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Failed to update document");
    }
  };

  const courses = useMemo(() => {
    const set = new Set();
    (rows || []).forEach((a) => a?.program?.course && set.add(a.program.course));
    return ["", ...Array.from(set)];
  }, [rows]);

  if (!authChecked) {
    return <div className="container py-10 text-sm text-gray-500">Checking admin…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        <button
          className="btn"
          onClick={async () => {
            try {
              await api.post("/auth/logout");
            } catch {}
            window.location.replace("/admin/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label">Search</label>
          <input
            className="input"
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Name..."
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All</option>
            <option value="draft">draft</option>
            <option value="submitted">submitted</option>
            <option value="under-review">under-review</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </div>
        <div>
          <label className="label">Course</label>
          <select
            className="input"
            value={filters.course}
            onChange={(e) => setFilters((f) => ({ ...f, course: e.target.value }))}
          >
            {courses.map((c) => (
              <option key={c} value={c}>
                {c || "All courses"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List + Detail */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* List */}
        <div className="card overflow-hidden">
          <div className="border-b p-3 text-sm text-gray-600">
            {loading ? "Loading..." : `${rows.length} applications`}
          </div>
          <div className="max-h-[70vh] overflow-auto divide-y">
            {loading ? (
              <div className="p-3 text-gray-500">Loading...</div>
            ) : rows.length === 0 ? (
              <div className="p-3 text-gray-500">No records</div>
            ) : (
              rows.map((a) => (
                <button
                  key={a._id}
                  className={`w-full text-left p-3 hover:bg-gray-50 ${
                    activeId === a._id ? "bg-gray-100" : ""
                  }`}
                  onClick={() => setActiveId(a._id)}
                >
                  <div className="font-medium">{a.personal?.fullName || "—"}</div>
                  <div className="text-xs text-gray-500">
                    {a.program?.course || "—"} • {a.status} •{" "}
                    {a.fee?.isPaymentEnabled ? "Payment Enabled" : "Payment Locked"}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="md:col-span-2">
          <div className="card p-4">
            {error && (
              <div className="mb-3 p-2 text-sm rounded border border-red-300 bg-red-50 text-red-700">
                {error}
              </div>
            )}

            {!activeId ? (
              <div className="text-sm text-gray-500">Select an application</div>
            ) : loadingDetail ? (
              <div className="text-sm text-gray-500">Loading details...</div>
            ) : !detail ? (
              <div className="text-sm text-gray-500">No details</div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">
                      {detail.personal?.fullName || "Applicant"}
                    </div>
                    <div className="text-xs text-gray-500">{detail._id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="input"
                      value={detail.status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="draft">draft</option>
                      <option value="submitted">submitted</option>
                      <option value="under-review">under-review</option>
                      <option value="approved">approved</option>
                      <option value="rejected">rejected</option>
                    </select>
                    <button className="btn" onClick={togglePayment}>
                      {detail.fee?.isPaymentEnabled ? "Disable Payment" : "Enable Payment"}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded border">
                    <div className="font-medium mb-2">Personal</div>
                    <KV label="Gender" value={detail.personal?.gender} />
                    <KV label="Phone" value={detail.personal?.phone} />
                  </div>
                  <div className="p-3 rounded border">
                    <div className="font-medium mb-2">Program</div>
                    <KV label="Course" value={detail.program?.course} />
                    <KV label="Branch" value={detail.program?.branch} />
                    <KV label="Quota" value={detail.program?.quota} />
                  </div>
                  <div className="p-3 rounded border">
                    <div className="font-medium mb-2">Fee</div>
                    <KV
                      label="Amount"
                      value={`${detail.fee?.amount ?? 0} ${detail.fee?.currency || "USD"}`}
                    />
                    <KV label="Status" value={detail.fee?.status} />
                    <KV
                      label="Payment Gate"
                      value={detail.fee?.isPaymentEnabled ? "Enabled" : "Locked"}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-medium mb-2">Documents</div>
                  <div className="space-y-2">
                    {(detail.documents || []).map((d, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div>
                          <div className="font-medium">{d.kind || `Document ${i + 1}`}</div>
                          {d.url ? (
                            <a
                              className="text-blue-600 text-sm"
                              href={fixCloudinaryDocUrl(d.url)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">No URL</span>
                          )}
                          <div className="text-xs text-gray-500">Status: {d.status}</div>
                          {d.note && (
                            <div className="text-xs text-gray-500">Note: {d.note}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button className="btn" onClick={() => updateDoc(i, "verified")}>
                            Verify
                          </button>
                          <button className="btn" onClick={() => updateDoc(i, "rejected")}>
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {!detail.documents?.length && (
                      <div className="text-sm text-gray-500">No documents uploaded</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="text-sm">
      <span className="text-gray-500">{label}: </span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
