'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import { api } from '@/lib/api-client';

type CommentRow = {
    id: string;
    content: string;
    createdAt: string;
    author: { name: string };
    post: { id: string; title: string; slug: string };
};

function Content() {
    const [comments, setComments] = useState<CommentRow[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const res = await api.get('/comments/admin/all');
        setComments(res.data.items);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    async function removeComment(id: string) {
        if (!confirm('Xoá bình luận này?')) return;
        await api.delete(`/comments/${id}`);
        load();
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8 heading-gradient inline-block">Quản lý bình luận</h1>
            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : comments.length === 0 ? (
                <p className="text-gray-400">Chưa có bình luận nào.</p>
            ) : (
                <div className="space-y-4">
                    {comments.map((c) => (
                        <div key={c.id} className="card p-5">
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                <span>
                                    <span className="font-semibold text-gray-700">{c.author.name}</span> · trong{' '}
                                    <Link href={`/posts/${c.post.slug}`} className="text-brand-600 hover:underline">
                                        {c.post.title}
                                    </Link>
                                </span>
                                <span className="text-xs">{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                            <button
                                onClick={() => removeComment(c.id)}
                                className="text-red-600 text-sm hover:underline mt-3 font-medium"
                            >
                                Xoá
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminCommentsPage() {
    return (
        <AdminGuard>
            <Content />
        </AdminGuard>
    );
}