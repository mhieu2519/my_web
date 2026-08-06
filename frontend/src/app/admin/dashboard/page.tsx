'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import AdminGuard from '@/components/AdminGuard';

type PostRow = {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  author: { name: string };
  _count: { comments: number };
};

function DashboardContent() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get('/posts/admin/all');
    setPosts(res.data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Xoá bài viết này? Hành động không thể hoàn tác.')) return;
    await api.delete(`/posts/${id}`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản trị bài viết</h1>
        <Link href="/admin/posts/new" className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark">
          + Viết bài mới
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-400">Chưa có bài viết nào.</p>
      ) : (
        <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="px-4 py-2">Tiêu đề</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Bình luận</th>
              <th className="px-4 py-2">Cập nhật</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-t text-sm">
                <td className="px-4 py-2">{p.title}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {p.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}
                  </span>
                </td>
                <td className="px-4 py-2">{p._count.comments}</td>
                <td className="px-4 py-2">{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-2 text-right space-x-3">
                  <Link href={`/admin/posts/${p.id}/edit`} className="text-brand hover:underline">
                    Sửa
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
