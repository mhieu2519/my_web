import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) { }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, role },
      { secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn: '15m' },
    );

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { tokenHash: this.hashToken(refreshToken), userId, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  private async sendVerification(userId: string, email: string, name: string) {
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerificationToken.create({
      data: {
        tokenHash: this.hashToken(token),
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const link = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.mail.sendVerificationEmail(email, name, link);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, name: dto.name },
    });

    await this.sendVerification(user.id, user.email, user.name);

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, emailVerified: user.emailVerified },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (user.isBanned) throw new ForbiddenException('Tài khoản đã bị khoá');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        avatarUrl: user.avatarUrl, emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  async findOrCreateGoogleUser(data: { googleId: string; email: string; name: string; avatarUrl?: string }) {
    let user = await this.prisma.user.findUnique({ where: { googleId: data.googleId } });
    if (user) return user;

    user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (user) {
      // Tài khoản email/password đã tồn tại -> liên kết Google vào
      return this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: data.googleId, emailVerified: true },
      });
    }

    return this.prisma.user.create({
      data: {
        googleId: data.googleId,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
        emailVerified: true,
      },
    });
  }

  async issueTokensForUser(userId: string, email: string, role: string) {
    return this.issueTokens(userId, email, role);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Thiếu refresh token');

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    if (stored.user.isBanned) throw new ForbiddenException('Tài khoản đã bị khoá');

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const tokens = await this.issueTokens(stored.user.id, stored.user.email, stored.user.role);
    return {
      user: {
        id: stored.user.id, email: stored.user.email, name: stored.user.name,
        role: stored.user.role, emailVerified: stored.user.emailVerified,
      },
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Không tiết lộ email có tồn tại hay không
    if (!user || !user.passwordHash) return { success: true };

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash: this.hashToken(token),
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    const link = `${this.config.get('FRONTEND_URL')}/reset-password/${token}`;
    await this.mail.sendPasswordResetEmail(user.email, user.name, link);
    return { success: true };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = this.hashToken(token);
    const stored = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, used: false, expiresAt: { gt: new Date() } },
    });
    if (!stored) throw new UnauthorizedException('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');

    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: stored.id }, data: { used: true } }),
      this.prisma.refreshToken.updateMany({ where: { userId: stored.userId }, data: { revoked: true } }),
    ]);
    return { success: true };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const stored = await this.prisma.emailVerificationToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
    if (!stored) throw new UnauthorizedException('Link xác thực không hợp lệ hoặc đã hết hạn');

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: stored.userId }, data: { emailVerified: true } }),
      this.prisma.emailVerificationToken.delete({ where: { id: stored.id } }),
    ]);
    return { success: true };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.emailVerified) return { success: true };
    await this.sendVerification(user.id, user.email, user.name);
    return { success: true };
  }
}