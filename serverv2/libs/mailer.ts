import { configDotenv } from 'dotenv';
configDotenv({
  quiet: true
});
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import { logErr } from './mongoose';
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
export default async function mailto(data: Omit<MailOptions, 'from'>) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Ilyafy" <${GMAIL_USER}>`,
      ...data,
    });
    if (info && typeof info.response === 'string' && info.response.toLowerCase().includes('ok')) {
      return {
        success: true,
        message: 'Email sent successfully',
        info
      };
    }

    return {
      success: false,
      message: 'Failed to send email',
      info
    };
  } catch (err) {
    console.error('Failed to send email:', err);
    logErr(err);
    return {
      success: false,
      message: 'Failed to send email',
      error: err
    };
  }
}