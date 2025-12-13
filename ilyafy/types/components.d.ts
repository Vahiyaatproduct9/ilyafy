export type authMethod = 'login' | 'signUpEmail' | 'signUpPassword' | null;
export type theme = 'dark' | 'light';
export type profile = {
  name: string;
  id: string;
  room_part_of: string | null;
  email: string;
}
export type TokenProps = {
  success?: boolean;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  userId?: string;
} | undefined

export type signInProps = {
  message: string;
  profile: profile,
  token: {
    accessToken: string;
    refreshToken: string;
    success: boolean;
  }
}

export type signUp = {
  message?: string;
  success?: boolean;
  userId?: string;
}

export type themeType = {
  background: string;
  primary: string;
  secondary: string;
  text: string;
  accent: string;
};