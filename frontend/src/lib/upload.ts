import { api } from './api-client';

// Xin chữ ký từ backend, rồi upload thẳng file lên Cloudinary (không qua backend)
export async function uploadToCloudinary(
  file: File,
  folder: 'posts' | 'avatars' = 'posts',
): Promise<string> {
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
