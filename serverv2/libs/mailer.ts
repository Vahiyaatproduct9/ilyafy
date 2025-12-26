import { configDotenv } from 'dotenv';
configDotenv({
  path: '.env',
  quiet: true
});
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
export default async function mailto(data: Omit<MailOptions, 'from'>) {
  console.log('GMAIL_PASS:', process.env.GMAIL_PASS);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    port: 465,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Ilyafy" <${process.env.GMAIL_USER}>`,
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
    return {
      success: false,
      message: 'Failed to send email',
      error: err
    };
  }
}