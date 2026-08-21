import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import 'multer';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(userId: number, file: Express.Multer.File, folder: 'posts' | 'avatars' = 'posts') {
    if (!file) throw new BadRequestException('Thiếu file ảnh');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Định dạng ảnh không được hỗ trợ (chỉ nhận JPG, PNG, WEBP, GIF)');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Ảnh vượt quá 5MB');
    }

    const uploadFolder = `my_web/${folder}/${userId}`;

    return new Promise<{ secureUrl: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: uploadFolder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ secureUrl: result.secure_url });
        },
      );
      stream.end(file.buffer);
    });
  }
}