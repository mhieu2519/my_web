import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsEmail } from 'class-validator';
import { NewsletterService } from './newsletter.service';

class SubscribeDto {
    @IsEmail()
    email!: string;
}

@Controller('newsletter')
export class NewsletterController {
    constructor(private newsletterService: NewsletterService) { }

    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('subscribe')
    subscribe(@Body() dto: SubscribeDto) {
        return this.newsletterService.subscribe(dto.email);
    }
}