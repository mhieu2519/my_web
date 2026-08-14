import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
    constructor(private prisma: PrismaService) { }

    async subscribe(email: string) {
        try {
            await this.prisma.newsletter.create({ data: { email } });
        } catch {
            // Email đã tồn tại — vẫn coi là thành công để không lộ thông tin
        }
        return { success: true };
    }
}