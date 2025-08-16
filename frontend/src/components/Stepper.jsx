export default function Stepper({ steps = [], current = 0 }) {
  return (
    <ol className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <li key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
            ${i <= current ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {i + 1}
          </div>
          <span className={`text-sm ${i <= current ? 'text-brand-700' : 'text-gray-500'}`}>{s}</span>
          {i < steps.length - 1 && <div className="w-8 h-0.5 bg-gray-300 mx-2" />}
        </li>
      ))}
    </ol>
  )
}
