import deleteUser from "../../api/auth/deleteUser";

export default async () => {
  try {
    return await deleteUser();
  } catch (error) {
    console.log('Error deleting user:', error);
    return {
      success: false,
      message: 'Error deleting user account. Please try again later.',
    }
  }
}