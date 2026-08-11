'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { uploadToCloudinary } from '@/lib/upload';
import PostEditor from '@/components/PostEditor';

type InitialData = {
  id?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  tags?: { name: string }[];
};

export default function PostForm({ initial }: { initial?: InitialData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [content, setContent] = useState(initial?.content || '');
  const [coverImage, setCoverImage] = useState(initial?.coverImage || '');
  const [tags, setTags] = useState((initial?.tags || []).map((t) => t.name).join(', '));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file, 'posts');
    setCoverImage(url);
  }

  async function handleSubmit(status: 'DRAFT' | 'PUBLISHED') {
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    setSubmitting(true);
    const payload = {
      title,
      excerpt: excerpt || undefined,
      content,
      coverImage: coverImage || undefined,
      status,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (initial?.id) {
        await api.patch(`/posts/${initial.id}`, payload);
      } else {
        await api.post('/posts', payload);
      }
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card p-8 space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700">Tiêu đề</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-brand-400 focus:outline-none transition-colors"
          placeholder="Tiêu đề bài viết"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700">Mô tả ngắn (excerpt)</label>
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
          placeholder="Hiện ở trang danh sách bài viết"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Ảnh bìa</label>
        <input type="file" accept="image/*" onChange={handleCoverUpload} className="text-sm" />
        {coverImage && <img src={coverImage} alt="cover" className="mt-3 h-40 rounded-xl2 object-cover" />}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700">Thẻ (phân cách bởi dấu phẩy)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
          placeholder="ví dụ: điện tử, firmware, DIY"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Nội dung</label>
        <PostEditor content={content} onChange={setContent} />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={() => handleSubmit('DRAFT')} disabled={submitting} className="btn-outline">
          Lưu nháp
        </button>
        <button onClick={() => handleSubmit('PUBLISHED')} disabled={submitting} className="btn-primary">
          Đăng bài
        </button>
      </div>
    </div>
  );
}