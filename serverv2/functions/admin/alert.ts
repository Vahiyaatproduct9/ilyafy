import mailto from "@libs/mailer"
import { Request } from "express"

export default {
  wrongKey: (offenderReq: Request) => {
    const headers = Object(offenderReq.headers)
    const body = offenderReq.body;
    const query = offenderReq.query;
    const time = new Date().toLocaleString();
    const ip = offenderReq.ip;
    const content = JSON.stringify({
      headers, body, query, time, ip
    }, null, 2);
    mailto({
      to: process.env.ADMIN_EMAIL,
      subject: 'Someone tried to access logs.',
      priority: 'high',
      html: content,
      attachments: [{
        filename: 'offenderReq.txt',
        content
      }]
    })
  }
}