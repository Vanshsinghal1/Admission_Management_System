# College Admission Frontend (Vite + React + Tailwind)

A complete starter for your Admission Management System frontend. Works in **mock mode** by default (no backend needed).

## Quickstart
```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## Connect to Backend
- Set `VITE_API_URL` in `.env` to your backend (e.g., `http://localhost:5000/api`).
- Set `VITE_USE_MOCK=false` to switch off mocks.

## Pages
- `/` Home
- `/auth/login`, `/auth/register`
- `/apply` multi-step form
- `/application/status`
- `/payment/checkout` (Razorpay-ready; needs backend + key)
- `/id/virtual`
- `/admin` (mock table)
