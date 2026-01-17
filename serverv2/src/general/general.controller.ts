import { Controller, Get } from "@nestjs/common";

@Controller()
export default class GeneralController {
  @Get()
  startup() {
    return {
      message: 'Server started Successfully.'
    }
  }
}