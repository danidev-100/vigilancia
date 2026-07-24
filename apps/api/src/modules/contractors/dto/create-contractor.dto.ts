import { IsString, IsOptional, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateContractorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  company!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  employeeName!: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  vehicleBrand?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  serviceType!: string;

  @IsOptional()
  @IsString()
  workOrder?: string;

  @IsDateString()
  authorizedUntil!: string;
}
