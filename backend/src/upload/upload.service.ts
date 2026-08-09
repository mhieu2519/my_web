import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  // Ký chữ ký để client upload thẳng lên Cloudinary, không qua server (nhẹ tải backend)
  createSignedUpload(userId: string, folder: 'posts' | 'avatars' = 'posts') {
    const timestamp = Math.round(Date.now() / 1000);
    const uploadFolder = `my_web/${folder}/${userId}`;

    // Chỉ những tham số nằm trong object này mới được đưa vào chữ ký,
    // client phải gửi lên đúng các tham số này khi upload thì chữ ký mới khớp
    const paramsToSign = { timestamp, folder: uploadFolder };
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.config.get('CLOUDINARY_API_SECRET')!,
    );

    return {
      signature,
      timestamp,
      folder: uploadFolder,
      apiKey: this.config.get('CLOUDINARY_API_KEY'),
      cloudName: this.config.get('CLOUDINARY_CLOUD_NAME'),
    };
  }
}
