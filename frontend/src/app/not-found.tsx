import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-800">404</h1>
            <p className="text-gray-500 mt-2">Không tìm thấy trang hoặc bài viết bạn đang tìm.</p>
            <Link href="/" className="inline-block mt-6 text-brand hover:underline">
                ← Quay về trang chủ
            </Link>
        </div>
    );
}