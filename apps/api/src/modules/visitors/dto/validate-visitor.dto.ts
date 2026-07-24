import { IsString, IsOptional } from 'class-validator';

export class ValidateVisitorDto {
  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
