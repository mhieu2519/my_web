'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { api } from '@/lib/api-client';

type TagRow = {
    id: string;
    name: string;
    slug: string;
    _count: { posts: number };
};

function Content() {
    const [tags, setTags] = useState<TagRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    async function load() {
        setLoading(true);
        const res = await api.get('/tags');
        setTags(res.data);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    function startEdit(t: TagRow) {
        setEditingId(t.id);
        setEditValue(t.name);
    }

    async function saveEdit(id: string) {
        await api.patch(`/tags/${id}`, { name: editValue });
        setEditingId(null);
        load();
    }

    async function removeTag(t: TagRow) {
        if (t._count.posts > 0) {
            alert('Thẻ đang được dùng ở bài viết, không thể xoá.');
            return;
        }
        if (!confirm(`Xoá thẻ "${t.name}"?`)) return;
        await api.delete(`/tags/${t.id}`);
        load();
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8 heading-gradient inline-block">Quản lý thẻ</h1>
            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-brand-50 text-left text-sm text-gray-600">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Tên thẻ</th>
                                <th className="px-5 py-3 font-semibold">Số bài viết</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map((t) => (
                                <tr key={t.id} className="border-t border-gray-100 text-sm hover:bg-brand-50/40 transition-colors">
                                    <td className="px-5 py-3">
                                        {editingId === t.id ? (
                                            <input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="border-2 border-brand-200 rounded-lg px-3 py-1 focus:border-brand-400 focus:outline-none"
                                            />
                                        ) : (
                                            <span className="font-medium">{t.name}</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-gray-500">{t._count.posts}</td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        {editingId === t.id ? (
                                            <>
                                                <button onClick={() => saveEdit(t.id)} className="text-brand-600 hover:underline font-medium">
                                                    Lưu
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">
                                                    Huỷ
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEdit(t)} className="text-brand-600 hover:underline font-medium">
                                                    Sửa
                                                </button>
                                                <button onClick={() => removeTag(t)} className="text-red-600 hover:underline font-medium">
                                                    Xoá
                                                </button>
                                            </>
                                        )}
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

export default function AdminTagsPage() {
    return (
        <AdminGuard>
            <Content />
        </AdminGuard>
    );
}