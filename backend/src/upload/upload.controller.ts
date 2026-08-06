import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { IsIn, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';

class PresignDto {
  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  contentType: string;

  @IsOptional() @IsIn(['posts', 'avatars'])
  folder?: 'posts' | 'avatars';
}

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('presign')
  presign(@Req() req: any, @Body() dto: PresignDto) {
    return this.uploadService.createPresignedUpload(req.user.userId, dto.contentType, dto.folder);
  }
}
