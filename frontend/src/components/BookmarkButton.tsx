'use client';

import { FiBookmark } from 'react-icons/fi';

export default function BookmarkButton({
    bookmarked,
    onToggle,
    disabled,
    size = 16,
}: {
    bookmarked: boolean;
    onToggle: (e: React.MouseEvent) => void;
    disabled?: boolean;
    size?: number;
}) {
    return (
        <button
            onClick={onToggle}
            disabled={disabled}
            aria-label={bookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-50 ${bookmarked
                ? 'bg-brand-gradient text-white'
                : 'bg-white/85 dark:bg-brand-900/70 text-gray-600 dark:text-gray-300 hover:text-brand-600'
                }`}
        >
            <FiBookmark size={size} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
    );
}