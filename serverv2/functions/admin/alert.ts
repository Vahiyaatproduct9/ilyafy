import mailto from "@libs/mailer"
import { Request } from "express"

const adminAlerts = {
  getInfo: (offenderReq: Request) => {
    const headers = Object(offenderReq.headers)
    const body = offenderReq.body;
    const query = offenderReq.query;
    const time = new Date().toLocaleString();
    const ip = offenderReq.ip;
    const content = JSON.stringify({
      headers, body, query, time, ip
    }, null, 2);
    return content;
  },
  wrongKey: async (offenderReq: Request) => {
    const content = adminAlerts.getInfo(offenderReq);
    await mailto({
      to: process.env.ADMIN_EMAIL,
      subject: 'Someone tried to access logs.',
      text: content,
      html: '<p>See attached JSON for details.</p>',
      // attachments: [{
      //   filename: 'offenderReq.json',
      //   content
      // }]
    })
  },
  tooManyRequests: async (offenderReq: Request) => {
    const content = adminAlerts.getInfo(offenderReq);
    await mailto({
      to: process.env.ADMIN_EMAIL,
      subject: 'Too Many Requests',
      text: content,
      html: '<p>See attached JSON for details.</p>',
    })
  }
}

export default adminAlerts