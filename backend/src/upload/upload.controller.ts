import {
  Controller, Post, Body, UseGuards, Req,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsIn, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService, MAX_FILE_SIZE_BYTES } from './upload.service';

class UploadBodyDto {
  @IsOptional() @IsIn(['posts', 'avatars'])
  folder?: 'posts' | 'avatars';
}

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) { }

  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async uploadImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadBodyDto,
  ) {
    if (!file) throw new BadRequestException('Thiếu file ảnh');
    const result = await this.uploadService.uploadImage(req.user.userId, file, dto.folder);
    return { secure_url: result.secureUrl };
  }
}