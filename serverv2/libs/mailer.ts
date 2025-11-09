import { configDotenv } from 'dotenv';
configDotenv({
  path: '.env',
  quiet: true
});
import nodemailer from 'nodemailer';
export default async function mailto({ to, subject, html }: { to: string, subject: string, html: string }) {
  console.log('GMAIL_PASS:', process.env.GMAIL_PASS);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  })
  const info = await transporter.sendMail({
    from: `"Ilyafy" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
  console.log('Message sent:', info);
  if (info.response.toLowerCase().includes('ok')) {
    return {
      success: true,
      message: 'Email sent successfully'
    };
  }
  return {
    success: false,
    message: 'Failed to send email'
  };
}