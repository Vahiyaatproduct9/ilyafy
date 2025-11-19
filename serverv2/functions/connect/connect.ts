import prisma from "@libs/prisma";
export default class Connection {
  async search(email: string) {
    const result = await prisma.users.findUnique({
      where: {
        email
      },
      select: {
        name: true,
        email: true,
        id: true
      }
    });
    if (!result) {
      return {
        success: false,
        message: 'User not found!'
      }
    }
    return {
      success: true,
      message: 'Found User!',
      user: result
    }
  };
  async sendRequest(email: string) {
    // send Request
  }
}