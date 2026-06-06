interface EmailPayload {
  toEmail: string;
  toName?: string | null;
  subject: string;
  templateParams: Record<string, string | number | null | undefined>;
  admin?: boolean;
}

export async function sendCommerceEmail(payload: EmailPayload) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = payload.admin
    ? process.env.EMAILJS_ADMIN_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID
    : process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return { sent: false, reason: 'EmailJS is not configured' };
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey || undefined,
      template_params: {
        to_email: payload.toEmail,
        to_name: payload.toName || payload.toEmail,
        subject: payload.subject,
        ...payload.templateParams,
      },
    }),
  });

  return { sent: response.ok, status: response.status };
}
