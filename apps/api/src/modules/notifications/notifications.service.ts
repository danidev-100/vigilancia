import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        data: (dto.data ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    // TODO: Send FCM push notification
    // if (process.env.FCM_SERVER_KEY) {
    //   await this.sendFcmPush(dto.userId, dto.title, dto.message, dto.data);
    // }

    return notification;
  }

  async findByUser(userId: string, params: { skip: number; take: number; unreadOnly?: boolean }) {
    const where: Record<string, unknown> = { userId };
    if (params.unreadOnly) where.isRead = false;

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { data, total };
  }

  async markAsRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  // Placeholder for FCM push
  // private async sendFcmPush(userId: string, title: string, body: string, data?: Record<string, unknown>) {
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //     select: { fcmToken: true },
  //   });
  //   if (!user?.fcmToken) return;
  //
  //   const admin = await import('firebase-admin');
  //   await admin.messaging().send({
  //     token: user.fcmToken,
  //     notification: { title, body },
  //     data: data as Record<string, string>,
  //   });
  // }
}
