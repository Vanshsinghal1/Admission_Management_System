import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../components/Stepper";
import { api, USE_MOCK } from "../lib/api";
import { mockCreateApplication } from "../lib/mock";

const initial = {
  personal: { fullName: "", dob: "", gender: "", phone: "" },
  academic: { board: "", tenthPercent: "", twelfthPercent: "", jeePercent: "" },
  program: { course: "", branch: "", quota: "" },
  documents: { tenth: null, twelfth: null, jee: null },
};

export default function Apply() {
  const [data, setData] = useState(initial);
  const [step, setStep] = useState(0);
  const steps = ["Personal", "Academic", "Program", "Documents", "Review"];
  const navigate = useNavigate();

  const twelfthRef = useRef(null);
  const jeeRef = useRef(null);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleChange = (section, field, value) => {
    setData((d) => ({ ...d, [section]: { ...d[section], [field]: value } }));
  };

  const handleFile = (field, file) => {
    setData((d) => ({ ...d, documents: { ...d.documents, [field]: file } }));
  };

  // Step validation
  const isStepValid = () => {
    if (step === 0) {
      const { fullName, dob, gender, phone } = data.personal;
      const phoneValid = /^\d{10}$/.test(phone);
      const dobValid = /^\d{4}-\d{2}-\d{2}$/.test(dob);
      return fullName && gender && phoneValid && dobValid;
    }
    if (step === 1) {
      const { board, tenthPercent, twelfthPercent, jeePercent } = data.academic;
      const baseOk =
        tenthPercent >= 0 && tenthPercent <= 100 &&
        twelfthPercent >= 0 && twelfthPercent <= 100;
      if (board === "CBSE") {
        return baseOk && jeePercent >= 0 && jeePercent <= 100;
      }
      return baseOk;
    }
    if (step === 2) {
      const { course, branch, quota } = data.program;
      return course && branch && quota;
    }
    if (step === 3) {
      return data.documents.tenth && data.documents.twelfth && data.documents.jee;
    }
    return true;
  };

  const submit = async () => {
    try {
      if (USE_MOCK) {
        await mockCreateApplication({
          personal: data.personal,
          academic: data.academic,
          program: data.program,
        });
        alert("Application submitted (mock).");
        return navigate("/application/status");
      }

      // 1. create application
      const { data: created } = await api.post("/applications", {
        personal: data.personal,
        academic: data.academic,
        program: data.program,
      });

      // 2. upload docs in parallel (faster than sequential)
      const uploads = Object.entries(data.documents).map(async ([kind, file]) => {
        if (!file) return null;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("kind", kind);
        return api.post(`/documents/${created._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });
      await Promise.all(uploads);

      // 3. mark as submitted
      await api.patch(`/applications/${created._id}/submit`);

      alert("Application submitted successfully!");
      navigate("/application/status");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Submission failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto card p-6">
      <h1 className="text-xl font-semibold">Admission Form</h1>
      <Stepper steps={steps} current={step} />

      {/* Step 0: Personal */}
      {step === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input
              className="input"
              value={data.personal.fullName}
              onChange={(e) => handleChange("personal", "fullName", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input
              className="input"
              type="date"
              value={data.personal.dob}
              onChange={(e) => handleChange("personal", "dob", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Gender</label>
            <select
              className="input"
              value={data.personal.gender}
              onChange={(e) => handleChange("personal", "gender", e.target.value)}
            >
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              type="tel"
              maxLength={10}
              value={data.personal.phone}
              onChange={(e) => handleChange("personal", "phone", e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Step 1: Academic */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Board</label>
            <select
              className="input"
              value={data.academic.board}
              onChange={(e) => handleChange("academic", "board", e.target.value)}
            >
              <option value="">Select</option>
              <option>CBSE</option>
              <option>ICSE</option>
              <option>State Board</option>
            </select>
          </div>
          <div>
            <label className="label">10th %</label>
            <input
              className="input"
              type="number"
              value={data.academic.tenthPercent}
              onChange={(e) => {
                const val = Math.min(100, Math.max(0, Number(e.target.value || 0)));
                handleChange("academic", "tenthPercent", val);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") twelfthRef.current?.focus();
              }}
            />
          </div>
          <div>
            <label className="label">12th %</label>
            <input
              ref={twelfthRef}
              className="input"
              type="number"
              value={data.academic.twelfthPercent}
              onChange={(e) => {
                const val = Math.min(100, Math.max(0, Number(e.target.value || 0)));
                handleChange("academic", "twelfthPercent", val);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") jeeRef.current?.focus();
              }}
            />
          </div>
          {data.academic.board === "CBSE" && (
            <div>
              <label className="label">JEE Main %</label>
              <input
                ref={jeeRef}
                className="input"
                type="number"
                value={data.academic.jeePercent}
                onChange={(e) => {
                  const val = Math.min(100, Math.max(0, Number(e.target.value || 0)));
                  handleChange("academic", "jeePercent", val);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Program */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Course</label>
            <select
              className="input"
              value={data.program.course}
              onChange={(e) => handleChange("program", "course", e.target.value)}
            >
              <option value="">Select</option>
              <option>BTECH</option>
              <option>MTECH</option>
              <option>MCA</option>
              <option>MBA</option>
              <option>BBA</option>
            </select>
          </div>
          <div>
            <label className="label">Branch</label>
            <select
              className="input"
              value={data.program.branch}
              onChange={(e) => handleChange("program", "branch", e.target.value)}
            >
              <option value="">Select</option>
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
              <option>CIVIL</option>
              <option>MECHANICAL</option>
              <option>CS-AIML</option>
              <option>CS-DS</option>
            </select>
          </div>
          <div>
            <label className="label">Quota</label>
            <select
              className="input"
              value={data.program.quota}
              onChange={(e) => handleChange("program", "quota", e.target.value)}
            >
              <option value="">Select</option>
              <option>General</option>
              <option>Management</option>
              <option>Sports</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="label">Upload 10th Marksheet (PDF/JPG/PNG)</label>
            <input
              className="input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFile("tenth", e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <label className="label">Upload 12th Marksheet (PDF/JPG/PNG)</label>
            <input
              className="input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFile("twelfth", e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <label className="label">Upload JEE Main Marksheet (PDF/JPG/PNG)</label>
            <input
              className="input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFile("jee", e.target.files?.[0] || null)}
            />
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="card p-4 border">
            <h2 className="font-semibold text-lg">Personal</h2>
            <pre>{JSON.stringify(data.personal, null, 2)}</pre>
          </div>
          <div className="card p-4 border">
            <h2 className="font-semibold text-lg">Academic</h2>
            <pre>{JSON.stringify(data.academic, null, 2)}</pre>
          </div>
          <div className="card p-4 border">
            <h2 className="font-semibold text-lg">Program</h2>
            <pre>{JSON.stringify(data.program, null, 2)}</pre>
          </div>
          <div className="card p-4 border">
            <h2 className="font-semibold text-lg">Documents</h2>
            <p>
              10th: {data.documents.tenth?.name || "—"} <br />
              12th: {data.documents.twelfth?.name || "—"} <br />
              JEE: {data.documents.jee?.name || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button className="btn-outline" onClick={prev} disabled={step === 0}>
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            className="btn-primary"
            onClick={next}
            disabled={!isStepValid()}
          >
            Next
          </button>
        ) : (
          <button className="btn-primary" onClick={submit}>
            Submit Application
          </button>
        )}
      </div>
    </div>
  );
}
