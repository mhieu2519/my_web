'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IoSearch, IoClose } from 'react-icons/io5';

export default function SearchBox({ initialQuery }: { initialQuery: string }) {
    const [value, setValue] = useState(initialQuery);
    const router = useRouter();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const params = new URLSearchParams();
        if (value.trim()) params.set('q', value.trim());
        router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="w-full bg-transparent dark:bg-transparent border-2 border-gray-300/80 dark:border-brand-700 dark:text-gray-100 rounded-full pl-11 pr-11 py-2.5 focus:border-brand-400 focus:outline-none transition-colors backdrop-blur-sm"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => setValue('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    aria-label="Xoá"
                >
                    <IoClose size={18} />
                </button>
            )}
        </form>
    );
}