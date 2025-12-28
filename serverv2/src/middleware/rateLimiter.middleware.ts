import adminAlerts from "@functions/admin/alert";
import { HttpStatus, NestMiddleware } from "@nestjs/common"
import { Request, Response, NextFunction } from "express";
const users = new Map<string, {
  count: number,
  expiresIn: number
}>();
export default class RateLimiter implements NestMiddleware {
  private readonly LIMIT = 5;
  private readonly WINDOW_MS = 700;
  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const now = Date.now();
    if (!ip) return next();
    const userData = users.get(ip);
    if (!userData || now > userData.expiresIn) {
      users.set(ip, { count: 1, expiresIn: now + this.WINDOW_MS });
      return next();
    }
    userData.count++;
    if (userData.count > this.LIMIT) {
      adminAlerts.tooManyRequests(req);
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
        success: false,
      })
    }
    next();
  }
}