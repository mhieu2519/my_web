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
    const buildHref = (page: number) => {
        const separator = basePath.includes('?') ? '&' : '?';
        return `${basePath}${separator}page=${page}`;
    };

    return (
        <div className="flex items-center justify-center gap-4 mt-12">
            {currentPage > 1 ? (
                <Link href={buildHref(currentPage - 1)} className="btn-outline text-sm">
                    ← Trước
                </Link>
            ) : (
                <span className="px-5 py-2.5 rounded-full text-sm text-gray-300 border-2 border-gray-100 dark:border-brand-700 dark:text-gray-600">← Trước</span>
            )}

            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages ? (
                <Link href={buildHref(currentPage + 1)} className="btn-primary text-sm">
                    Sau →
                </Link>
            ) : (
                <span className="px-5 py-2.5 rounded-full text-sm text-gray-300 border-2 border-gray-100 dark:border-brand-700 dark:text-gray-600">Sau →</span>
            )}
        </div>
    );
}