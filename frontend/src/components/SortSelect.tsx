'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function SortSelect({ value }: { value: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (newSort && newSort !== 'newest') {
            params.set('sort', newSort);
        } else {
            params.delete('sort');
        }

        // Đổi kiểu sắp xếp thì reset về trang 1
        params.delete('page');

        const queryString = params.toString();
        router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    };

    return (
        <select
            value={value}
            onChange={handleChange}
            className="border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 dark:text-gray-100 rounded-xl px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
        >
            <option value="newest">Mới nhất</option>
            <option value="popular">Xem nhiều nhất</option>
        </select>
    );
}