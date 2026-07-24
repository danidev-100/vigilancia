import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { PropertyStatus } from '@vigilancia/shared';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  houseNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  block?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  street?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  neighborhood?: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;
}
