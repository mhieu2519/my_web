// frontend/src/lib/upload.ts
import { api } from './api-client';

const MAX_FILE_SIZE_MB = 5; // tuỳ chỉnh theo nhu cầu
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function uploadToCloudinary(
  file: File,
  folder: 'posts' | 'avatars' = 'posts',
): Promise<string> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Ảnh vượt quá ${MAX_FILE_SIZE_MB}MB. Vui lòng chọn ảnh nhỏ hơn.`);
  }

  const { data } = await api.post('/upload/presign', { folder });
  const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = data;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', signedFolder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Tải ảnh lên Cloudinary thất bại');
  }

  const result = await res.json();
  return result.secure_url as string;
}