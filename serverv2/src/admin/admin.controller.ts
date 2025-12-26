import { Controller, Get, Headers, Req } from "@nestjs/common";
import { IncomingHttpHeaders } from "http";
import AdminService from "./admin.service";
import { Request } from "express";

@Controller('admin')
export default class AdminController {
  constructor(private adminService: AdminService) { }
  @Get('logs')
  get(@Headers() headers: IncomingHttpHeaders & {
    'X-Key'?: string,
    'x-key': string
  },
    @Req() req: Request) {
    this.adminService.logs(headers["X-Key"] || headers['x-key'], req)
  }
}