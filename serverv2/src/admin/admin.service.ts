import alert from "@functions/admin/alert";
import sendLogs from "@functions/admin/sendLogs";
import { Injectable } from "@nestjs/common";
import { configDotenv } from "dotenv";
import { Request } from "express";
configDotenv();
@Injectable()
export default class AdminService {
  async logs(key: string, req: Request) {
    console.log('key:', key);
    console.log('Secret: ', process.env.ADMIN_SECRET);
    if (key === process.env.ADMIN_SECRET) {
      await sendLogs('logs.txt', './logs.txt')
      return {
        message: 'logs sent to admin!',
        success: true,
      }
    } else {
      await alert.wrongKey(req)
      return {
        success: false,
        message: 'Incorrect key, reporting admin.'
      }
    }
  }
}