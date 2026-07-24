import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { PersonType, EntryMethod } from '@vigilancia/shared';

export class CreateEntryDto {
  @IsEnum(PersonType)
  personType!: PersonType;

  @IsOptional()
  @IsUUID()
  visitorId?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @IsOptional()
  @IsUUID()
  contractorId?: string;

  @IsOptional()
  @IsUUID()
  familyMemberId?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsString()
  gate!: string;

  @IsOptional()
  @IsEnum(EntryMethod)
  entryMethod?: EntryMethod;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
