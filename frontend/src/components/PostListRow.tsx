'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tagColor } from '@/lib/tagColors';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import BookmarkButton from './BookmarkButton';
import type { PostSummary } from './PostList';
import { WiTime2 } from "react-icons/wi";

export default function PostListRow({ posts }: { posts: PostSummary[] }) {
    const { user } = useAuth();
    const router = useRouter();
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setBookmarkedIds(new Set());
            return;
        }
        api.get('/bookmarks/mine/ids').then((res) => setBookmarkedIds(new Set(res.data))).catch(() => { });
    }, [user]);

    async function handleToggle(e: React.MouseEvent, postId: string) {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            router.push('/login');
            return;
        }
        if (busyId) return;
        setBusyId(postId);
        const wasBookmarked = bookmarkedIds.has(postId);
        setBookmarkedIds((prev) => {
            const next = new Set(prev);
            wasBookmarked ? next.delete(postId) : next.add(postId);
            return next;
        });
        try {
            await api.post(`/bookmarks/${postId}/toggle`);
        } catch {
            setBookmarkedIds((prev) => {
                const next = new Set(prev);
                wasBookmarked ? next.add(postId) : next.delete(postId);
                return next;
            });
        } finally {
            setBusyId(null);
        }
    }

    if (posts.length === 0) {
        return (
            <div className="text-center text-gray-400 py-24">
                <p className="text-lg">Chưa có bài viết nào.</p>
            </div>
        );
    }
    const authorAvatar = posts[0].author.avatarUrl || posts[0].author.avatar || posts[0].author.image;
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(posts[0].author.name)}&background=random`;

    return (
        <div className="space-y-5">
            {posts.map((post) => {
                const primaryTag = post.tags[0];
                const color = primaryTag ? tagColor(primaryTag.name) : null;
                return (
                    <article key={post.id} className="card overflow-hidden group flex gap-4 p-4 relative">
                        <Link href={`/posts/${post.slug}`} className="flex gap-4 flex-1 min-w-0">
                            {post.coverImage && (
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-32 h-24 sm:w-40 sm:h-28 rounded-xl2 object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
                                />
                            )}
                            <div className="min-w-0 flex flex-col">
                                {color && (
                                    <span className={`self-start text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5 ${color.bg} ${color.text}`}>
                                        {primaryTag!.name}
                                    </span>
                                )}
                                <h2 className="font-display text-base sm:text-lg font-bold leading-snug hover:text-brand-600 dark:hover:text-brand-300 transition-colors line-clamp-2 dark:text-gray-100">
                                    {post.title}
                                </h2>
                                {post.excerpt && (
                                    <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                                )}
                                <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <img
                                            src={authorAvatar || fallbackAvatar}
                                            alt={post.author.name}
                                            className="w-5 h-5 rounded-full object-cover shrink-0 border border-gray-200 dark:border-gray-700"
                                        />

                                        <span className="font-medium text-gray-600 dark:text-gray-300 truncate">
                                            {post.author.name}
                                        </span>

                                    </div>
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        <WiTime2 className="text-base text-gray-400" />
                                        <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    {typeof post.readTimeMinutes === 'number' && <span>⏱ {post.readTimeMinutes} phút đọc</span>}
                                    {typeof post.views === 'number' && <span>👁 {post.views}</span>}
                                </div>
                            </div>
                        </Link>
                        <div className="shrink-0">
                            <BookmarkButton
                                bookmarked={bookmarkedIds.has(post.id)}
                                onToggle={(e) => handleToggle(e, post.id)}
                                disabled={busyId === post.id}
                            />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}