import { IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class signUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
export class SignInDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email.' })
  email: string;

  @IsNotEmpty()
  password: string;
}
export class emailVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  code: number;
}

export class refreshToken {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}