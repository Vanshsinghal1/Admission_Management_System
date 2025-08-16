import { api, USE_MOCK } from '../lib/api'
import { mockCreateOrder, mockVerifyPayment } from '../lib/mock'
import { useState } from 'react'

export default function PaymentCheckout() {
  const [amount, setAmount] = useState(500) // INR
  const [loading, setLoading] = useState(false)

  const pay = async () => {
    setLoading(true)
    try {
      if (USE_MOCK) {
        const order = await mockCreateOrder(amount * 100)
        alert('Mock order created: ' + order.id)
        await mockVerifyPayment()
        alert('Payment verified (mock).')
      } else {
        // Backend order creation
        const { data: order } = await api.post('/payments/order', { amount: amount * 100, applicationId: 'me' })
        const opts = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          order_id: order.id,
          name: 'College Admission Fee',
          handler: async (response) => {
            await api.post('/payments/verify', {
              applicationId: 'me',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            alert('Payment verified!')
          }
        }
        const rp = new window.Razorpay(opts)
        rp.open()
      }
    } catch (e) {
      console.error(e)
      alert('Payment failed or cancelled.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Application Fee Payment</h1>
      <div className="mt-4">
        <label className="label">Amount (INR)</label>
        <input className="input" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </div>
      <button className="btn-primary w-full mt-4" onClick={pay} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      <p className="text-xs text-gray-500 mt-3">
        Note: For live payment, set <code>VITE_API_URL</code> and <code>VITE_RAZORPAY_KEY_ID</code> in <code>.env</code>.
      </p>
    </div>
  )
}
