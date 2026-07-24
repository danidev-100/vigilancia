import { IsString, MinLength, IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  password!: string;

  @IsUUID()
  token!: string;
}
