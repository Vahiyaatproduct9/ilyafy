import getAccessTokenfromHeaders from "@functions/others/getAccessTokenfromHeaders";
import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { IncomingHttpHeaders } from "http";
@Injectable()
export class AccessTokenCheck implements NestMiddleware {
  use(req: Request, _: Response, next: NextFunction) {
    const headers = req?.headers as IncomingHttpHeaders & { authorization: string };
    const token = getAccessTokenfromHeaders(headers);
    if (!token) {
      throw new NotFoundException({
        success: false,
        message: 'Access Token Not Found!'
      })
    }
    next();
  }
}