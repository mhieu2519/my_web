// frontend/src/lib/cloudinary.ts

/**
 * Chèn f_auto,q_auto vào URL Cloudinary để tự động tối ưu định dạng + dung lượng.
 * extra: có thể truyền thêm transform, vd 'w_400' để giới hạn chiều rộng tải về.
 */
export function cldOptimize(url?: string | null, extra?: string): string {
    if (!url) return '';
    if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
    const transform = extra ? `f_auto,q_auto,${extra}` : 'f_auto,q_auto';
    return url.replace('/upload/', `/upload/${transform}/`);
}