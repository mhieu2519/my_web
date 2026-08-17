'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import { api } from '@/lib/api-client';

function Content() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        const res = await api.get('/posts/admin/pending');
        setPosts(res.data.items);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function approve(id: string) {
        await api.patch(`/posts/${id}`, { status: 'PUBLISHED' });
        load();
    }

    async function reject(id: string) {
        if (!confirm('Từ chối bài viết này?')) return;
        await api.patch(`/posts/${id}`, { status: 'REJECTED' });
        load();
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8 heading-gradient inline-block">Bài viết chờ duyệt</h1>
            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : posts.length === 0 ? (
                <p className="text-gray-400">Không có bài viết nào đang chờ duyệt.</p>
            ) : (
                <div className="space-y-4">
                    {posts.map((p) => (
                        <div key={p.id} className="card p-5 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{p.title}</p>
                                <p className="text-xs text-gray-400 mt-1">Tác giả: {p.author.name} {p.isPrivate && '· 🔒 Riêng tư'}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link href={`/admin/posts/${p.id}/edit`} className="text-brand-600 hover:underline text-sm font-medium">Xem</Link>
                                <button onClick={() => approve(p.id)} className="btn-primary !px-4 !py-1.5 text-sm">Duyệt</button>
                                <button onClick={() => reject(p.id)} className="btn-outline !px-4 !py-1.5 text-sm text-red-600 border-red-200 hover:bg-red-50">Từ chối</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function AdminPendingPage() {
    return (
        <AdminGuard>
            <Content />
        </AdminGuard>
    );
}