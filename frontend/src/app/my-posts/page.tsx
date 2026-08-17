'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-600' },
    PENDING: { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-700' },
    PUBLISHED: { label: 'Đã đăng', className: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Bị từ chối', className: 'bg-red-100 text-red-700' },
};

export default function MyPostsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [busy, setBusy] = useState(true);

    useEffect(() => {
        if (!loading && !user) router.push('/login');
    }, [user, loading, router]);

    useEffect(() => {
        if (!user) return;
        api.get('/posts/mine').then((res) => setPosts(res.data.items)).finally(() => setBusy(false));
    }, [user]);

    async function handleDelete(id: string) {
        if (!confirm('Xoá bài viết này?')) return;
        await api.delete(`/posts/${id}`);
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    if (loading || !user) return null;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold heading-gradient inline-block">Bài viết của tôi</h1>
                <Link href="/write" className="btn-primary text-sm">+ Viết bài mới</Link>
            </div>
            {busy ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : posts.length === 0 ? (
                <p className="text-gray-400">Bạn chưa có bài viết nào.</p>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-brand-50 text-left text-sm text-gray-600">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Tiêu đề</th>
                                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                                <th className="px-5 py-3 font-semibold">Riêng tư</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100 text-sm">
                                    <td className="px-5 py-3 font-medium">{p.title}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_LABEL[p.status]?.className}`}>
                                            {STATUS_LABEL[p.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">{p.isPrivate ? '🔒 Có' : '—'}</td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        <Link href={`/admin/posts/${p.id}/edit`} className="text-brand-600 hover:underline font-medium">Sửa</Link>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline font-medium">Xoá</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}