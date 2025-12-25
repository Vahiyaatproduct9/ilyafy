import { Injectable, NestMiddleware } from "@nestjs/common";
import { log } from "console";
import { Request, Response, NextFunction } from "express";
import fs from 'fs/promises';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, _: Response, next: NextFunction) {
    const data = `${new Date().toLocaleString()} - ${req.ip?.split(':').find(t => t.length > 6)} - ${req.method} - ${req.originalUrl}\n`
    console.log(data)
    try {
      fs.appendFile('logs.txt', data, { encoding: 'utf8' })
    } catch (err) {
      log('Couldnt log to file', err)
    }
    next()
  }
}