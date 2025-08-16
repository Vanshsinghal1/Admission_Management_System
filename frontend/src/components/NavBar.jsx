import { Link, NavLink } from 'react-router-dom'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-xl text-sm font-medium ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`
      }>
      {children}
    </NavLink>
  )
}

export default function NavBar() {
  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="font-semibold text-brand-700">Admission System</Link>
        <nav className="flex items-center gap-2">
          <NavItem to="/apply">Apply</NavItem>
          <NavItem to="/application/status">Status</NavItem>
          <NavItem to="/payment/checkout">Fee Payment</NavItem>
          <NavItem to="/id/virtual">Virtual ID</NavItem>
          <NavItem to="/admin">Admin</NavItem>
          <NavItem to="/auth/login">Login</NavItem>
        </nav>
      </div>
    </header>
  )
}
