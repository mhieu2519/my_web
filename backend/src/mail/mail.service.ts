import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.config.get('SMTP_HOST'),
            port: Number(this.config.get('SMTP_PORT') || 587),
            secure: false,
            auth: {
                user: this.config.get('SMTP_USER'),
                pass: this.config.get('SMTP_PASS'),
            },
        });
    }

    private async send(to: string, subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: this.config.get('MAIL_FROM'),
                to,
                subject,
                html,
            });
        } catch (err) {
            // Không throw để không làm fail luồng đăng ký/quên mật khẩu nếu SMTP lỗi tạm thời
            this.logger.error(`Gửi email tới ${to} thất bại`, err as Error);
        }
    }

    async sendVerificationEmail(to: string, name: string, link: string) {
        await this.send(
            to,
            'Xác thực email của bạn',
            `<p>Xin chào ${name},</p>
       <p>Bấm vào link bên dưới để xác thực email (hết hạn sau 24 giờ):</p>
       <p><a href="${link}">${link}</a></p>`,
        );
    }

    async sendPasswordResetEmail(to: string, name: string, link: string) {
        await this.send(
            to,
            'Đặt lại mật khẩu',
            `<p>Xin chào ${name},</p>
       <p>Bấm vào link bên dưới để đặt lại mật khẩu (hết hạn sau 1 giờ). Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
       <p><a href="${link}">${link}</a></p>`,
        );
    }
}