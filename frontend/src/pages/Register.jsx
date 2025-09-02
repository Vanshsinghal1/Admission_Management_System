import { useForm } from 'react-hook-form'
import { api, USE_MOCK } from '../lib/api'
import { mockRegister } from '../lib/mock'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    try {
      if (USE_MOCK) {
        const res = await mockRegister(values)
        alert(res.message)
        navigate('/auth/login') // ✅ register ke baad login page
      } else {
        const { data } = await api.post('/auth/register', values)
        alert(data.message)
        navigate('/auth/login') // ✅ register ke baad login page
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Create an account</h1>
      <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label">Full name</label>
          <input className="input" {...register('name', { required: true })} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" {...register('email', { required: true })} />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" {...register('password', { required: true, minLength: 6 })} />
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait...' : 'Register'}
        </button>
      </form>
    </div>
  )
}
