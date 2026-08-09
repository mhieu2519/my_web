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
            <h1 className="text-2xl font-bold mb-6">Quản lý thẻ</h1>
            {loading ? (
                <p className="text-gray-400">Đang tải...</p>
            ) : (
                <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                    <thead className="bg-gray-100 text-left text-sm">
                        <tr>
                            <th className="px-4 py-2">Tên thẻ</th>
                            <th className="px-4 py-2">Số bài viết</th>
                            <th className="px-4 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tags.map((t) => (
                            <tr key={t.id} className="border-t text-sm">
                                <td className="px-4 py-2">
                                    {editingId === t.id ? (
                                        <input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="border rounded px-2 py-1"
                                        />
                                    ) : (
                                        t.name
                                    )}
                                </td>
                                <td className="px-4 py-2">{t._count.posts}</td>
                                <td className="px-4 py-2 text-right space-x-3">
                                    {editingId === t.id ? (
                                        <>
                                            <button onClick={() => saveEdit(t.id)} className="text-brand hover:underline">
                                                Lưu
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">
                                                Huỷ
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEdit(t)} className="text-brand hover:underline">
                                                Sửa
                                            </button>
                                            <button onClick={() => removeTag(t)} className="text-red-600 hover:underline">
                                                Xoá
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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