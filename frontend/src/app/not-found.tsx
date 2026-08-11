import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="text-center py-24 card mx-auto max-w-md p-10">
            <div className="text-5xl mb-4">🔍</div>
            <h1 className="text-4xl font-extrabold heading-gradient inline-block">404</h1>
            <p className="text-gray-500 mt-3">Không tìm thấy trang hoặc bài viết bạn đang tìm.</p>
            <Link href="/" className="btn-primary inline-block mt-6">
                ← Quay về trang chủ
            </Link>
        </div>
    );
}