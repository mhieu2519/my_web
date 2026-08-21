import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import { BadRequestException } from '@nestjs/common/exceptions';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

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

  private async issueTokens(userId: number, email: string, role: string) {
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

  private async sendVerification(userId: number, email: string, name: string) {
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

  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_MINUTES = 15;

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (user.isBanned) throw new ForbiddenException('Tài khoản đã bị khoá');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Tài khoản tạm khoá do đăng nhập sai nhiều lần. Thử lại sau ${minutesLeft} phút.`);
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= this.MAX_ATTEMPTS;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : attempts,
          lockedUntil: shouldLock ? new Date(Date.now() + this.LOCKOUT_MINUTES * 60000) : null,
        },
      });
      if (shouldLock) {
        throw new ForbiddenException(`Sai mật khẩu quá ${this.MAX_ATTEMPTS} lần. Tài khoản tạm khoá ${this.LOCKOUT_MINUTES} phút.`);
      }
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await this.prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
    }

    if (user.twoFactorEnabled) {
      const tempToken = this.jwt.sign(
        { sub: user.id, stage: '2fa' },
        { secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn: '5m' },
      );
      return { requires2FA: true, tempToken };
    }

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
  async findOrCreateGithubUser(data: { githubId: string; email: string; name: string; avatarUrl?: string }) {
    let user = await this.prisma.user.findUnique({ where: { githubId: data.githubId } });
    if (user) return user;

    user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (user) {
      return this.prisma.user.update({
        where: { id: user.id },
        data: { githubId: data.githubId, emailVerified: true },
      });
    }

    return this.prisma.user.create({
      data: {
        githubId: data.githubId,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
        emailVerified: true,
      },
    });
  }
  async issueTokensForUser(userId: number, email: string, role: string) {
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

  async resendVerification(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.emailVerified) return { success: true };
    await this.sendVerification(user.id, user.email, user.name);
    return { success: true };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new BadRequestException('Tài khoản này đăng nhập qua Google/Github, không thể đổi mật khẩu theo cách này');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Mật khẩu hiện tại không đúng');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } }),
    ]);
    return { success: true };
  }

  async setup2FA(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const secret = authenticator.generateSecret();
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret, twoFactorEnabled: false } });

    const otpauth = authenticator.keyuri(user.email, 'Lặng 24', secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth);
    return { qrDataUrl, secret };
  }

  async confirm2FA(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) throw new UnauthorizedException('Chưa khởi tạo 2FA');
    if (!authenticator.check(code, user.twoFactorSecret)) throw new UnauthorizedException('Mã xác thực không đúng');
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
    return { success: true };
  }

  async disable2FA(userId: number) {
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
    return { success: true };
  }

  async loginWith2FA(tempToken: string, code: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(tempToken, { secret: this.config.get('JWT_ACCESS_SECRET') });
    } catch {
      throw new UnauthorizedException('Phiên xác thực đã hết hạn, vui lòng đăng nhập lại');
    }
    if (payload.stage !== '2fa') throw new UnauthorizedException('Token không hợp lệ');

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.twoFactorSecret || !authenticator.check(code, user.twoFactorSecret)) {
      throw new UnauthorizedException('Mã xác thực không đúng');
    }

    const tokens = await this.issueTokens(user.id, user.email, user.role);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl, emailVerified: user.emailVerified },
      ...tokens,
    };
  }
}