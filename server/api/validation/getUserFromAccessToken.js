import sbs from "../../libs/createAuth.js";
export default async (jwt) => {
  const { data, error } = await sbs.auth.getUser(jwt);
  if (error) {
    return {
      success: false,
      id: null,
      error,
    };
  }
  return {
    success: true,
    id: data.user.id,
    error: null,
  };
};
