import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Apply from './pages/Apply'
import ApplicationStatus from './pages/ApplicationStatus'
import PaymentCheckout from './pages/PaymentCheckout'
import VirtualID from './pages/VirtualID'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div>
      <NavBar />
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/application/status" element={<ApplicationStatus />} />
          <Route path="/payment/checkout" element={<PaymentCheckout />} />
          <Route path="/id/virtual" element={<VirtualID />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
