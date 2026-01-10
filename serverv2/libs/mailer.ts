import { configDotenv } from 'dotenv';
import sgMail from '@sendgrid/mail';
import { logErr } from './mongoose';

configDotenv({
  quiet: true,
});

// Define a compatible MailOptions interface to remove nodemailer dependency
export interface MailOptions {
  to?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  attachments?: {
    content: string; // base64 encoded content
    filename: string;
    type?: string;
    disposition?: string;
    contentId?: string;
  }[];
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const GMAIL_USER = process.env.GMAIL_USER; // This should be a verified sender in SendGrid

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.error(
    'SENDGRID_API_KEY is not set. Email functionality will be disabled.',
  );
}

export default async function mailto(data: MailOptions) {
  if (!SENDGRID_API_KEY || !GMAIL_USER) {
    const reason = !SENDGRID_API_KEY ? 'SENDGRID_API_KEY' : 'GMAIL_USER';
    const errorMessage = `Failed to send email: ${reason} is not configured.`;
    console.error(errorMessage);
    return {
      success: false,
      message: errorMessage,
    };
  }


  try {
    const [response] = await sgMail.send({
      from: `Ilyafy <${GMAIL_USER}>`,
      to: data.to,
      cc: data?.cc || [],
      bcc: data?.bcc || [],
      subject: data?.subject || undefined,
      text: data?.text || 'no-content',
      html: data?.html || undefined,
      attachments: data?.attachments || [],
      replyTo: process.env.ADMIN_EMAIL || GMAIL_USER,
    });

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {
        success: true,
        message: 'Email sent successfully',
        info: response,
      };
    }

    return {
      success: false,
      message: 'Failed to send email',
      info: response,
    };
  } catch (err: any) {
    console.error('Failed to send email:', err.response?.body || err);
    logErr(err);
    return {
      success: false,
      message: 'Failed to send email',
      error: err,
    };
  }
}