'use client';

import { useEffect, useState } from 'react';

export default function TableOfContents({ headings }: { headings: { id: string; text: string }[] }) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: '-100px 0px -70% 0px' },
        );
        headings.forEach((h) => {
            const el = document.getElementById(h.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [headings]);

    return (
        <div className="card p-5">
            <h3 className="font-bold text-sm mb-3 text-gray-800 dark:text-gray-100">Mục lục</h3>
            <ol className="space-y-1 text-sm">
                {headings.map((h, i) => (
                    <li
                        key={h.id}
                        className={`border-l-2 pl-3 py-1 transition-colors ${activeId === h.id ? 'border-brand-500' : 'border-transparent'}`}
                    >
                        <a
                            href={`#${h.id}`}
                            className={`line-clamp-2 transition-colors ${activeId === h.id
                                ? 'text-brand-700 dark:text-brand-300 font-medium'
                                : 'text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-300'
                                }`}
                        >
                            {i + 1}. {h.text}
                        </a>
                    </li>
                ))}
            </ol>
        </div >
    );
}