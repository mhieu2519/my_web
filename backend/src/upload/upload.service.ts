import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get('R2_BUCKET')!;
    this.publicBaseUrl = this.config.get('R2_PUBLIC_URL')!;
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.config.get('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.config.get('R2_ACCESS_KEY_ID')!,
        secretAccessKey: this.config.get('R2_SECRET_ACCESS_KEY')!,
      },
    });
  }

  // Trả về presigned URL để client upload thẳng lên R2, không qua server (nhẹ tải cho backend)
  async createPresignedUpload(userId: string, contentType: string, folder: 'posts' | 'avatars' = 'posts') {
    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new BadRequestException('Định dạng ảnh không được hỗ trợ');
    }

    const ext = contentType.split('/')[1];
    const key = `${folder}/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 }); // 5 phút

    return {
      uploadUrl,
      publicUrl: `${this.publicBaseUrl}/${key}`,
      key,
    };
  }
}
