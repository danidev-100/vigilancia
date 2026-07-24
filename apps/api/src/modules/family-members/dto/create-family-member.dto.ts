import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateFamilyMemberDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  phone!: string;

  @IsString()
  relationship!: string;

  @IsOptional()
  @IsString()
  photo?: string;
}
