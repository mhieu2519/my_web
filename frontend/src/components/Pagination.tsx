import Link from 'next/link';

export default function Pagination({
    currentPage,
    totalPages,
    basePath,
}: {
    currentPage: number;
    totalPages: number;
    basePath: string;
}) {
    if (totalPages <= 1) return null;

    const buildHref = (page: number) => `${basePath}?page=${page}`;

    return (
        <div className="flex items-center justify-center gap-3 mt-10">
            {currentPage > 1 ? (
                <Link href={buildHref(currentPage - 1)} className="px-4 py-2 border rounded hover:bg-gray-100 text-sm">
                    ← Trang trước
                </Link>
            ) : (
                <span className="px-4 py-2 border rounded text-sm text-gray-300 cursor-not-allowed">← Trang trước</span>
            )}

            <span className="text-sm text-gray-500">
                Trang {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
                <Link href={buildHref(currentPage + 1)} className="px-4 py-2 border rounded hover:bg-gray-100 text-sm">
                    Trang sau →
                </Link>
            ) : (
                <span className="px-4 py-2 border rounded text-sm text-gray-300 cursor-not-allowed">Trang sau →</span>
            )}
        </div>
    );
}