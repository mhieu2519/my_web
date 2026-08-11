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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold heading-gradient inline-block">Quản trị bài viết</h1>
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <Link href="/admin/users" className="px-3 py-1.5 rounded-full hover:bg-brand-50 text-gray-600 hover:text-brand-600 transition-colors">Người dùng</Link>
          <Link href="/admin/comments" className="px-3 py-1.5 rounded-full hover:bg-brand-50 text-gray-600 hover:text-brand-600 transition-colors">Bình luận</Link>
          <Link href="/admin/tags" className="px-3 py-1.5 rounded-full hover:bg-brand-50 text-gray-600 hover:text-brand-600 transition-colors">Thẻ</Link>
          <Link href="/admin/stats" className="px-3 py-1.5 rounded-full hover:bg-brand-50 text-gray-600 hover:text-brand-600 transition-colors">Thống kê</Link>
          <Link href="/admin/posts/new" className="btn-primary text-sm">
            + Viết bài mới
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : posts.length === 0 ? (
        <p className="text-gray-400">Chưa có bài viết nào.</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-brand-50 text-left text-sm text-gray-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Tiêu đề</th>
                <th className="px-5 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 font-semibold">Bình luận</th>
                <th className="px-5 py-3 font-semibold">Cập nhật</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 text-sm hover:bg-brand-50/40 transition-colors">
                  <td className="px-5 py-3 font-medium">{p.title}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                      {p.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{p._count.comments}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <Link href={`/admin/posts/${p.id}/edit`} className="text-brand-600 hover:underline font-medium">
                      Sửa
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline font-medium">
                      Xoá
                    </button>
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

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}