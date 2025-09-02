import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Your College Admissions</h1>
        <p className="mt-3 text-gray-600">
          Apply online, upload documents, pay application fee, and get your virtual student ID — all in one place.
        </p>
        <div className="mt-6 flex gap-3">
          <Link to="/apply" className="btn-primary">Apply Now</Link>
          <Link to="/auth/register" className="btn-outline">Register</Link> {/* 👈 Ye button add */}
          <Link to="/auth/login" className="btn-outline">Login</Link>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="card p-4"><div className="text-2xl font-bold">10k+</div><div className="text-sm text-gray-500">Applicants</div></div>
          <div className="card p-4"><div className="text-2xl font-bold">30+</div><div className="text-sm text-gray-500">Programs</div></div>
          <div className="card p-4"><div className="text-2xl font-bold">100%</div><div className="text-sm text-gray-500">Secure</div></div>
        </div>
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-semibold">Quick Links</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li><Link to="/application/status" className="text-brand-700 underline">Check Application Status</Link></li>
          <li><Link to="/payment/checkout" className="text-brand-700 underline">Pay Application Fee</Link></li>
          <li><Link to="/id/virtual" className="text-brand-700 underline">View Virtual ID</Link></li>
        </ul>
      </div>
    </div>
  )
}
