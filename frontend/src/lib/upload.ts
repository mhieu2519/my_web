// frontend/src/lib/upload.ts
import { api } from './api-client';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function uploadToCloudinary(
  file: File,
  folder: 'posts' | 'avatars' = 'posts',
): Promise<string> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Ảnh vượt quá ${MAX_FILE_SIZE_MB}MB. Vui lòng chọn ảnh nhỏ hơn.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const { data } = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.secure_url as string;
}