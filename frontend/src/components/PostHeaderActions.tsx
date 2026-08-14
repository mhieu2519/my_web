'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiBookmark, FiShare2 } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa6';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import ShareButtons from './ShareButtons';

export default function PostHeaderActions({
    postId,
    reactionsTotal,
    shareUrl,
    shareTitle,
}: {
    postId: string;
    reactionsTotal: number;
    shareUrl: string;
    shareTitle: string;
}) {
    const { user } = useAuth();
    const router = useRouter();
    const [bookmarked, setBookmarked] = useState(false);
    const [busy, setBusy] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            setBookmarked(false);
            return;
        }
        api.get('/bookmarks/mine/ids').then((res) => setBookmarked((res.data as string[]).includes(postId))).catch(() => { });
    }, [user, postId]);

    async function toggleBookmark() {
        if (!user) {
            router.push('/login');
            return;
        }
        if (busy) return;
        setBusy(true);
        const prev = bookmarked;
        setBookmarked(!prev);
        try {
            await api.post(`/bookmarks/${postId}/toggle`);
        } catch {
            setBookmarked(prev);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={toggleBookmark}
                disabled={busy}
                aria-label={bookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors disabled:opacity-50 ${bookmarked
                    ? 'bg-brand-gradient text-white border-transparent'
                    : 'border-gray-200 dark:border-brand-700 text-gray-500 dark:text-gray-300 hover:border-brand-300'
                    }`}
            >
                <FiBookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>

            <div className="flex items-center gap-1.5 px-3.5 h-10 rounded-full border-2 border-gray-200 dark:border-brand-700 text-sm text-gray-600 dark:text-gray-300">
                <FaHeart className="text-rose-500" size={14} />
                {reactionsTotal}
            </div>

            <div className="relative">
                <button
                    onClick={() => setShareOpen((o) => !o)}
                    aria-label="Chia sẻ"
                    className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-brand-700 text-gray-500 dark:text-gray-300 hover:border-brand-300 transition-colors"
                >
                    <FiShare2 size={16} />
                </button>
                {shareOpen && (
                    <div className="absolute right-0 mt-2 card p-3 z-20 shadow-lg border border-brand-100 dark:border-brand-700">
                        <ShareButtons url={shareUrl} title={shareTitle} />
                    </div>
                )}
            </div>
        </div>
    );
}