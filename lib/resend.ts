const RESEND_API = 'https://api.resend.com'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — email not sent')
    return { sent: false, error: 'RESEND_API_KEY not configured' }
  }

  const from = `${process.env.RESEND_FROM_NAME ?? 'Eight Wide'} <${process.env.RESEND_FROM_EMAIL ?? 'newsletter@speedchampions.cz'}>`

  const res = await fetch(`${RESEND_API}/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!res.ok) {
    const error = await res.text()
    console.error('Resend error:', error)
    return { sent: false, error }
  }

  return { sent: true }
}
