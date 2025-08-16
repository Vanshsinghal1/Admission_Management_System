import { sleep } from './api'

let _application = null
let _users = [{ id: '1', name: 'Admin', email: 'admin@college.edu', role: 'admin' }]

export async function mockRegister(payload) {
  await sleep(600)
  return { message: 'Registered. Check email to verify.' }
}
export async function mockLogin(payload) {
  await sleep(500)
  const role = payload.email?.includes('admin') ? 'admin' : 'student'
  localStorage.setItem('auth', JSON.stringify({ name: payload.email.split('@')[0], role }))
  return { message: 'Logged in', user: { name: payload.email.split('@')[0], role } }
}
export async function mockLogout() {
  await sleep(300)
  localStorage.removeItem('auth')
  return { message: 'Logged out' }
}

export async function mockCreateApplication(data) {
  await sleep(700)
  _application = { id: 'app_mock_1', status: 'submitted', fee: { status: 'unpaid' }, ...data }
  localStorage.setItem('application', JSON.stringify(_application))
  return _application
}
export async function mockMeApplication() {
  await sleep(400)
  const a = _application || JSON.parse(localStorage.getItem('application') || 'null')
  return a
}
export async function mockUpload(kind) {
  await sleep(400)
  return { url: `https://dummyimage.com/200x200/ddd/000&text=${encodeURIComponent(kind)}` }
}
export async function mockCreateOrder(amount) {
  await sleep(500)
  return { id: 'order_mock_1', amount, currency: 'INR' }
}
export async function mockVerifyPayment() {
  await sleep(400)
  if (_application) _application.fee.status = 'paid'
  return { message: 'Payment verified' }
}
export async function mockAdminList() {
  await sleep(500)
  return [
    { id: 'app1', name: 'Aman Kumar', course: 'B.Tech CSE', status: 'under-review' },
    { id: 'app2', name: 'Meera Singh', course: 'BBA', status: 'approved' },
    { id: 'app3', name: 'Rohit Yadav', course: 'B.Tech ECE', status: 'submitted' },
  ]
}
