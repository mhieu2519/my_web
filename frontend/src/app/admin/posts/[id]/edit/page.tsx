'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import AuthGuard from '@/components/AuthGuard';
import PostForm from '../../PostForm';

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Dùng GET /posts/mine để lấy bài của chính user (mọi trạng thái),
    // nếu không tìm thấy thì thử qua admin/all (trường hợp admin sửa bài người khác)
    api.get('/posts/mine?pageSize=200')
      .then((res) => {
        const found = res.data.items.find((p: any) => p.id === id);
        if (found) {
          setPost(found);
          setLoading(false);
          return;
        }
        // Không phải bài của mình -> thử endpoint admin (chỉ admin gọi được, lỗi 403 nếu không phải)
        return api.get('/posts/admin/all?pageSize=200').then((res2) => {
          const foundAdmin = res2.data.items.find((p: any) => p.id === id);
          setPost(foundAdmin || null);
          setLoading(false);
        });
      })
      .catch(() => {
        setError('Không tìm thấy bài viết hoặc bạn không có quyền sửa.');
        setLoading(false);
      });
  }, [id]);

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-6 heading-gradient inline-block">Sửa bài viết</h1>
      {loading ? (
        <p className="text-gray-400">Đang tải...</p>
      ) : !post ? (
        <p className="text-red-600">{error || 'Không tìm thấy bài viết.'}</p>
      ) : (
        <PostForm
          initial={{
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            status: post.status,
            slug: post.slug,
            isFeatured: post.isFeatured,
            commentsEnabled: post.commentsEnabled,
            isPrivate: post.isPrivate,
            tags: post.tags,
          }}
        />
      )}
    </AuthGuard>
  );
}