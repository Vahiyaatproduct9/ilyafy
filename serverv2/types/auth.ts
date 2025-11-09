export interface SignUpData {
  name: string;
  email: string;
  password: string;
  room_part_of?: string;
}
export interface SignInData {
  email: string;
  password: string;
}
export interface emailVerificationData {
  email: string;
  code: string;
}
export interface refreshToken {
  refreshToken: string;
}
export type tokenType = {
  id: string;
  name: string;
  tokenVersion: number;
}