import { IsString, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { PersonType } from '@vigilancia/shared';

export class CreateVehicleDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  plate!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  brand!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  model!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  color?: string;

  @IsEnum(PersonType)
  ownerType!: PersonType;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  familyMemberId?: string;
}
