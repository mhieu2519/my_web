import { Controller, Post, Patch, Get, Body, Res, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dto/auth.dto';

const REFRESH_COOKIE = 'refresh_token';
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
    private config: ConfigService,
  ) { }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.register(dto);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    return { accessToken, user };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result: any = await this.authService.login(dto);
    if (result.requires2FA) return result;
    res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login/2fa')
  async loginWith2FA(
    @Body('tempToken') tempToken: string,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.authService.loginWith2FA(tempToken, code);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    return { accessToken, user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  setup2FA(@Req() req: any) {
    return this.authService.setup2FA(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/confirm')
  confirm2FA(@Req() req: any, @Body('code') code: string) {
    return this.authService.confirm2FA(req.user.userId, code);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  disable2FA(@Req() req: any) {
    return this.authService.disable2FA(req.user.userId);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    const { accessToken, refreshToken } = await this.authService.issueTokensForUser(
      user.id, user.email, user.role,
    );
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    res.redirect(`${this.config.get('FRONTEND_URL')}/auth/callback?accessToken=${accessToken}`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() { }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    const user = req.user;
    const { accessToken, refreshToken } = await this.authService.issueTokensForUser(
      user.id, user.email, user.role,
    );
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    res.redirect(`${this.config.get('FRONTEND_URL')}/auth/callback?accessToken=${accessToken}`);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    const { accessToken, refreshToken, user } = await this.authService.refresh(token);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
    return { accessToken, user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    await this.authService.logout(token);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true,
        emailVerified: true, createdAt: true, twoFactorEnabled: true,
        bio: true, location: true, websiteUrl: true, facebookUrl: true, instagramUrl: true, githubUrl: true,
      },
    });
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Get('verify-email')
  verifyEmail(@Req() req: Request) {
    const token = req.query.token as string;
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('resend-verification')
  resendVerification(@Req() req: any) {
    return this.authService.resendVerification(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Patch('change-password')
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.userId, dto.currentPassword, dto.newPassword);
  }

}