import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { GithubStrategy } from './github.strategy';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), MailModule],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GithubStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }