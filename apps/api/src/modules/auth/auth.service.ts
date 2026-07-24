import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload, AuthTokens, LoginResponse, UserProfile } from '@vigilancia/shared';
import { Role } from '@vigilancia/shared';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string): Promise<LoginResponse> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        phone: dto.phone ?? null,
        role: dto.role ?? Role.PROPERTY_OWNER,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role as unknown as Role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    await this.auditLogService.create({
      userId: user.id,
      action: 'REGISTER',
      entityType: 'USER',
      entityId: user.id,
      ipAddress,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.toProfile({ ...user, role: user.role as unknown as Role }),
    };
  }

  async login(dto: LoginDto, ipAddress?: string): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        photo: true,
        emailVerified: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role as unknown as Role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    await this.auditLogService.create({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role as unknown as Role,
        photo: user.photo,
        emailVerified: user.emailVerified,
      },
    };
  }

  async refreshToken(token: string, ipAddress?: string): Promise<AuthTokens> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, role: true, isActive: true } } },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      // Revoke if already used or expired
      if (stored && !stored.revoked) {
        await this.prisma.refreshToken.update({
          where: { id: stored.id },
          data: { revoked: true },
        });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!stored.user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Revoke old token (rotation)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const tokens = await this.generateTokens(stored.user.id, stored.user.email, stored.user.role as unknown as Role);
    await this.storeRefreshToken(stored.user.id, tokens.refreshToken);

    await this.auditLogService.create({
      userId: stored.user.id,
      action: 'TOKEN_REFRESH',
      entityType: 'USER',
      entityId: stored.user.id,
      ipAddress,
    });

    return tokens;
  }

  async logout(userId: string, refreshToken?: string, ipAddress?: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId },
        data: { revoked: true },
      });
    }

    // Revoke all user refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });

    await this.auditLogService.create({
      userId,
      action: 'LOGOUT',
      entityType: 'USER',
      entityId: userId,
      ipAddress,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists — always return success
      return;
    }

    const token = uuidv4();
    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // TODO: Send email with reset link
    // await this.emailService.sendPasswordReset(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const stored = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!stored || stored.type !== 'PASSWORD_RESET' || stored.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: stored.userId },
      data: { passwordHash },
    });

    // Delete used token
    await this.prisma.verificationToken.delete({ where: { id: stored.id } });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revoked: false },
      data: { revoked: true },
    });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        photo: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { ...user, role: user.role as unknown as Role };
  }

  // ---- Google OAuth ----

  async googleAuth(idToken: string, ipAddress?: string): Promise<LoginResponse> {
    try {
      const { OAuth2Client } = await import('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name || email.split('@')[0]!;
      const photo = payload.picture || null;

      // Check if user exists
      let user = await this.prisma.user.findUnique({ where: { email } });

      if (user) {
        // Link Google account if not already linked
        const existingAccount = await this.prisma.account.findFirst({
          where: { provider: 'GOOGLE', providerAccountId: googleId },
        });

        if (!existingAccount) {
          await this.prisma.account.create({
            data: {
              userId: user.id,
              provider: 'GOOGLE',
              providerAccountId: googleId,
              accessToken: idToken,
            },
          });
        }
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            photo,
            emailVerified: payload.email_verified ?? false,
            role: Role.PROPERTY_OWNER,
            accounts: {
              create: {
                provider: 'GOOGLE',
                providerAccountId: googleId,
                accessToken: idToken,
              },
            },
          },
        });
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role as unknown as Role);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      await this.auditLogService.create({
        userId: user.id,
        action: 'GOOGLE_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        ipAddress,
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: await this.getProfile(user.id),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Google authentication failed');
    }
  }

  // ---- Internal helpers ----

  private async generateTokens(userId: string, email: string, role: Role): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = uuidv4();

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + this.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      },
    });
  }

  private toProfile(user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: Role;
    photo: string | null;
    emailVerified: boolean;
  }): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      photo: user.photo,
      emailVerified: user.emailVerified,
    };
  }
}
