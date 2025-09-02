// src/components/FormDataTable.jsx
export default function FormDataTable({ title, data }) {
  // Common labels mapping
  const LABELS = {
    fullName: "Full Name",
    dob: "Date of Birth",
    tenthPercent: "10th Percentage",
    twelthPercent: "12th Percentage",
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    program: "Program Applied",
    branch: "Branch",
    status: "Application Status",
    fee: "Fee Status",
  }

  // Helper to format labels
  const formatLabel = (key) => {
    if (LABELS[key]) return LABELS[key]
    return key
      .replace(/([A-Z])/g, " $1") // camelCase → camel Case
      .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
  }

  return (
    <div className="card p-4 shadow-md rounded-xl border border-gray-200 bg-white">
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <table className="table-auto text-sm w-full">
        <tbody>
          {Object.entries(data || {}).map(([k, v]) => (
            <tr key={k} className="border-b last:border-none">
              <td className="py-2 pr-4 font-medium text-gray-700">{formatLabel(k)}</td>
              <td className="py-2 text-gray-600">{v || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
