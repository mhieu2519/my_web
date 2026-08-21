// Suy ra public_id từ 1 URL Cloudinary, để có thể xoá ảnh khi không dùng nữa
// VD: https://res.cloudinary.com/xxx/image/upload/v123/my_web/avatars/5/abc.jpg
//     -> public_id = my_web/avatars/5/abc
export function extractCloudinaryPublicId(url?: string | null): string | null {
    if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return null;
    const afterUpload = url.split('/upload/')[1];
    if (!afterUpload) return null;
    // bỏ phần version "v123456/" nếu có
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // bỏ phần đuôi file .jpg/.png...
    return withoutVersion.replace(/\.[a-zA-Z0-9]+$/, '');
}

// Trích toàn bộ src ảnh trong nội dung HTML của bài viết (bao gồm cả block ảnh gallery)
export function extractImageSrcs(html?: string | null): string[] {
    if (!html) return [];
    const srcs = new Set<string>();
    for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) srcs.add(m[1]);
    return Array.from(srcs);
}