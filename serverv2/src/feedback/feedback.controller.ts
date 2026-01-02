import { Body, Controller, Headers, Ip, Post } from "@nestjs/common";
import FeedbackService from "./feedback.service";
import getAccessTokenfromHeaders from "@functions/others/getAccessTokenfromHeaders";
import { httpHeader } from "types";
type feedbackBody = {
  body: string;
  anonymous?: boolean;
}
@Controller('feedback')
export default class FeedbackController {
  constructor(private feedbackService: FeedbackService) { }
  @Post()
  async post(@Headers() headers: httpHeader, @Body() body: feedbackBody, @Ip() ip: string) {
    const token = getAccessTokenfromHeaders(headers)
    console.log('nody:', body);
    const effectIp = ip.split(':')
    return await this.feedbackService.post({ token, body: body.body, ip_address: effectIp[effectIp.length - 1], anonymous: body.anonymous || false })
  }
}