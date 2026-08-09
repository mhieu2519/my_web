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
            <h1 className="text-2xl font-bold mb-6">Quản lý bình luận</h1>
            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : comments.length === 0 ? (
                <p className="text-gray-400">Chưa có bình luận nào.</p>
            ) : (
                <div className="space-y-3">
                    {comments.map((c) => (
                        <div key={c.id} className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                                <span>
                                    {c.author.name} · trong{' '}
                                    <Link href={`/posts/${c.post.slug}`} className="text-brand hover:underline">
                                        {c.post.title}
                                    </Link>
                                </span>
                                <span>{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">{c.content}</p>
                            <button
                                onClick={() => removeComment(c.id)}
                                className="text-red-600 text-sm hover:underline mt-2"
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