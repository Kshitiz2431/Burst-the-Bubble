import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(data: EmailPayload) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response;
  } catch (error:unknown) {
    console.error('Error sending email:');
    throw error;
  }
} 