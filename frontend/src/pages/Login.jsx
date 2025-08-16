import { useForm } from 'react-hook-form'
import { api } from '../lib/api'
import { USE_MOCK } from '../lib/api'
import { mockLogin } from '../lib/mock'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  const onSubmit = async (values) => {
    try {
      if (USE_MOCK) {
        await mockLogin(values)
        alert('Logged in (mock). Go to Apply or Admin.')
      } else {
        const { data } = await api.post('/auth/login', values)
        alert(data.message)
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register('email', { required: true })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" {...register('password', { required: true })} />
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-3">Tip: Use an email containing "admin" to see Admin page unlocked (mock).</p>
    </div>
  )
}
