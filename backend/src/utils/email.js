import nodemailer from 'nodemailer'

export const sendMail = async (to, subject, text) => {
  const host = process.env.SMTP_HOST
  if (!host) {
    console.log('[email disabled]', subject, '->', to, text)
    return
  }
  const t = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await t.sendMail({ from: process.env.EMAIL_FROM || 'no-reply@example.com', to, subject, text })
}
