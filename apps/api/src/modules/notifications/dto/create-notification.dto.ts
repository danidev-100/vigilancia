import { IsString, IsOptional, IsEnum, IsObject, IsUUID } from 'class-validator';
import { NotificationType } from '@vigilancia/shared';

export class CreateNotificationDto {
  @IsUUID()
  userId!: string;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
