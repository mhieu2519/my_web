'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tagColor } from '@/lib/tagColors';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import BookmarkButton from './BookmarkButton';
import { WiTime2 } from "react-icons/wi";

export type PostSummary = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: string;
    views?: number;
    readTimeMinutes?: number;
    author: {
        name: string;
        avatar?: string | null;
        avatarUrl?: string | null;
        image?: string | null;
    };
    tags: { id: string; name: string; slug: string }[];
    _count: { comments: number; reactions: number };
};

export default function PostList({ posts, columns = 2 }: { posts: PostSummary[]; columns?: 2 | 3 | 4 }) {
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

    const gridClass =
        columns === 4 ? 'grid sm:grid-cols-2 lg:grid-cols-4 gap-6'
            : columns === 3 ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'grid sm:grid-cols-2 gap-6';


    return (
        <div className={gridClass}>
            {posts.map((post) => {
                const primaryTag = post.tags[0];
                const color = primaryTag ? tagColor(primaryTag.name) : null;

                const authorAvatar = post.author.avatarUrl || post.author.avatar || post.author.image;

                const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`;

                return (
                    <article key={post.id} className="card overflow-hidden group flex flex-col relative">
                        <Link href={`/posts/${post.slug}`} className="contents">
                            {post.coverImage && (
                                <div className="overflow-hidden relative">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {color && (
                                        <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
                                            {primaryTag!.name}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="p-5 flex flex-col flex-1">
                                <h2 className="font-display text-lg font-bold leading-snug hover:text-brand-600 dark:hover:text-brand-300 transition-colors line-clamp-2 dark:text-gray-100">
                                    {post.title}
                                </h2>
                                {post.excerpt && (
                                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                                )}

                                {/* FOOTER THẺ BÀI VIẾT: AVATAR + TÊN TÁC GIẢ & ICON ĐỒNG HỒ + NGÀY */}
                                <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-gray-400">
                                    {/* 1. Tác giả có Avatar tròn */}
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

                                    {/* 2. Thời gian có Icon đồng hồ WiTime2 */}
                                    <div className="flex items-center gap-0.5 shrink-0">
                                        <WiTime2 className="text-base text-gray-400" />
                                        <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                                    </div>

                                    {/* 3. Lượt tương tác */}
                                    <span className="ml-auto flex items-center gap-2 shrink-0">
                                        <span>💬 {post._count.comments}</span>
                                        <span>✨ {post._count.reactions}</span>
                                    </span>
                                </div>
                            </div>
                        </Link>
                        <div className="absolute top-3 right-3">
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