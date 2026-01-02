import { verifyToken } from "@functions/secret/JWT";
import prisma from "@libs/prisma";
import { HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export default class FeedbackService {
  async post(arg: { token: string, body: string, ip_address: string, anonymous: boolean }) {
    const { data, success, message } = verifyToken(arg.token);
    if (!data) {
      return { success, message, statusCode: HttpStatus.UNAUTHORIZED }
    }
    const createdFB = await prisma.feedback.create({
      data: {
        user_id: !arg.anonymous ? data.id : null,
        body: arg.body,
        ip_address: arg.ip_address
      }
    });
    if (!createdFB) {
      return {
        success: false,
        message: "Coudn't post your feedback :(",
        statusCode: HttpStatus.NOT_IMPLEMENTED
      }
    }
    return {
      success: true,
      message: 'Feedback posted!',
      statusCode: HttpStatus.CREATED
    }
  }
}