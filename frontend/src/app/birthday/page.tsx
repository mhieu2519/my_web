import type { Metadata } from 'next';
import BirthdayClient from './BirthdayClient';

// Trang thiệp cần render động theo query string mỗi lần truy cập
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Thiệp sinh nhật 🎂',
    description: 'Một tấm thiệp sinh nhật nho nhỏ, thổi nến và mở lời chúc.',
};

// t=ddmmyyyy -> "dd-mm-yyyy"
function parseDate(raw?: string): string {
    if (!raw || raw.length !== 8 || !/^\d{8}$/.test(raw)) return '';
    return raw.replace(/(\d{2})(\d{2})(\d{4})/, '$1-$2-$3');
}

// p=url1,url2,url3 (mỗi url đã encodeURIComponent) -> tối đa 6 ảnh
function parsePhotos(raw?: string): string[] {
    if (!raw) return [];
    return raw
        .split(',')
        .map((s) => {
            try {
                return decodeURIComponent(s.trim());
            } catch {
                return s.trim();
            }
        })
        .filter(Boolean)
        .slice(0, 6);
}

type SearchParams = {
    t?: string; // ngày sinh: ddmmyyyy
    n?: string; // tên
    p?: string; // danh sách ảnh, phân tách bởi dấu phẩy
    m?: string; // lời chúc tuỳ chỉnh (ghi đè lời chúc mặc định)
};

export default async function BirthdayPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;

    const date = parseDate(params?.t);
    const name = params?.n ? decodeURIComponent(params.n) : 'bạn';
    const photos = parsePhotos(params?.p);
    const message = params?.m ? decodeURIComponent(params.m) : '';

    return <BirthdayClient date={date} name={name} photos={photos} message={message} />;
}