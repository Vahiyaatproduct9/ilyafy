import alert from "@functions/admin/alert";
import sendLogs from "@functions/admin/sendLogs";
import { Injectable } from "@nestjs/common";
import { configDotenv } from "dotenv";
import { Request } from "express";
configDotenv();
@Injectable()
export default class AdminService {
  logs(key: string, req: Request) {
    console.log('key:', key);
    console.log('Secret: ', process.env.ADMIN_SECRET);
    if (key === process.env.ADMIN_SECRET) {
      sendLogs('logs.txt', './logs.txt')
    } else {
      alert.wrongKey(req)
    }
  }
}