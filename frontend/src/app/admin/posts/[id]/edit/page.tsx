'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import AdminGuard from '@/components/AdminGuard';
import PostForm from '../../PostForm';

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Backend không có GET /posts/admin/:id riêng, nên ta lấy qua danh sách admin rồi lọc
    // (đơn giản cho bản đầu tiên; có thể thêm endpoint GET /posts/id/:id sau nếu cần)
    api.get('/posts/admin/all?pageSize=100').then((res) => {
      const found = res.data.items.find((p: any) => p.id === id);
      setPost(found || null);
      setLoading(false);
    });
  }, [id]);

  return (
    <AdminGuard>
      <h1 className="text-2xl font-bold mb-6">Sửa bài viết</h1>
      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : !post ? (
        <p className="text-red-600">Không tìm thấy bài viết.</p>
      ) : (
        <PostForm
          initial={{
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            status: post.status,
            tags: post.tags,
          }}
        />
      )}
    </AdminGuard>
  );
}
