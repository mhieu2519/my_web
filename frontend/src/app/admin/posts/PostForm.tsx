'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { uploadToCloudinary } from '@/lib/upload';
import PostEditor from '@/components/PostEditor';
import { slugify } from '@/lib/slugify';
import { cldOptimize } from '@/lib/cloudinary';
import { useAuth } from '@/hooks/useAuth';

type TagRow = { id: string; name: string; slug: string };

type InitialData = {
  id?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  slug?: string;
  isFeatured?: boolean;
  commentsEnabled?: boolean;
  isPrivate?: boolean;
  tags?: { name: string }[];
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function PostForm({ initial }: { initial?: InitialData }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [content, setContent] = useState(initial?.content || '');
  const [coverImage, setCoverImage] = useState(initial?.coverImage || '');
  const [slugValue, setSlugValue] = useState(initial?.slug || '');
  const [editingSlug, setEditingSlug] = useState(false);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [commentsEnabled, setCommentsEnabled] = useState(initial?.commentsEnabled ?? true);
  const [allTags, setAllTags] = useState<TagRow[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set((initial?.tags || []).map((t) => t.name)),
  );
  const [extraTagsInput, setExtraTagsInput] = useState('');
  const [extraTags, setExtraTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [isPrivate, setIsPrivate] = useState(initial?.isPrivate ?? false);
  const [quota, setQuota] = useState<{
    unlimited: boolean;
    limit: number | null;
    used: number;
    remaining: number;
  } | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      api.get('/posts/my-quota').then((res) => setQuota(res.data)).catch(() => { });
    }
  }, [isAdmin]);

  useEffect(() => {
    api.get('/tags').then((res) => setAllTags(res.data)).catch(() => { });
  }, []);

  // Autosave cục bộ (localStorage) — chỉ để tránh mất nội dung khi lỡ đóng tab, KHÔNG gửi lên backend
  useEffect(() => {
    const key = `post-draft:${initial?.id || 'new'}`;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify({ title, excerpt, content, coverImage }));
        setLastSavedAt(new Date());
      } catch { }
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, excerpt, content, coverImage, initial?.id]);

  // Tự sinh đường dẫn theo tiêu đề, trừ khi người dùng đã tự chỉnh sửa hoặc bài đã có slug sẵn
  useEffect(() => {
    if (!editingSlug && !initial?.slug) {
      setSlugValue(slugify(title));
    }
  }, [title, editingSlug, initial?.slug]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file, 'posts');
      setCoverImage(url);
    } catch (err: any) {
      alert(err.message || 'Tải ảnh lên thất bại.');
    }
  }


  function handleCoverDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    uploadToCloudinary(file, 'posts')
      .then(setCoverImage)
      .catch((err) => alert(err.message || 'Tải ảnh lên thất bại.'));
  }
  function addExtraTag() {
    const v = extraTagsInput.trim();
    if (!v) return;
    if (!extraTags.includes(v)) setExtraTags((prev) => [...prev, v]);
    setExtraTagsInput('');
  }

  function toggleCategory(name: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  async function handleSubmit(status: 'DRAFT' | 'PENDING' | 'PUBLISHED') {
    setError('');
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    const finalStatus = isAdmin ? status : (status === 'DRAFT' ? 'DRAFT' : 'PENDING');
    setSubmitting(true);
    const tags = Array.from(new Set([...Array.from(selectedCategories), ...extraTags]));
    const payload: any = {
      title,
      excerpt: excerpt || undefined,
      content,
      coverImage: coverImage || undefined,
      status: finalStatus,
      tags,
      isFeatured: isAdmin ? isFeatured : undefined,
      commentsEnabled,
      isPrivate,
    };
    if (editingSlug && slugValue.trim()) payload.slug = slugValue.trim();
    try {
      if (initial?.id) {
        await api.patch(`/posts/${initial.id}`, payload);
      } else {
        await api.post('/posts', payload);
      }
      localStorage.removeItem(`post-draft:${initial?.id || 'new'}`);
      router.push(isAdmin ? '/admin/dashboard' : '/my-posts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  }

  const wordCount = content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-5">
        <div className="card p-5">
          <div className="flex items-center justify-end mb-1">
            <span className="text-xs text-gray-400">{title.length}/120</span>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 120))}
            placeholder="Nhập tiêu đề bài viết..."
            className="w-full text-xl font-display font-bold border-none focus:outline-none placeholder:text-gray-300 dark:bg-transparent dark:text-white"
          />
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 flex-wrap">
            <span>Đường dẫn: {SITE_URL}/posts/</span>
            {editingSlug ? (
              <input
                value={slugValue}
                onChange={(e) => setSlugValue(slugify(e.target.value))}
                onBlur={() => setEditingSlug(false)}
                autoFocus
                className="border border-brand-200 dark:border-brand-700 rounded px-2 py-0.5 text-xs dark:bg-brand-800"
              />
            ) : (
              <span className="font-medium text-gray-600 dark:text-gray-300">{slugValue || '...'}</span>
            )}
            <button type="button" onClick={() => setEditingSlug(true)} className="text-brand-600 dark:text-brand-300 hover:underline">
              ✎ Chỉnh sửa
            </button>
          </div>
        </div>

        <div className="card p-5">
          <PostEditor content={content} onChange={setContent} />
          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
            <span>Số từ: {wordCount}</span>
            <span className="flex items-center gap-1.5">
              {lastSavedAt && (
                <>
                  Đã lưu lúc {lastSavedAt.toLocaleTimeString('vi-VN')}
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                </>
              )}
            </span>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Ảnh đại diện</h3>
          {coverImage ? (
            <div className="relative">
              <img src={cldOptimize(coverImage, 'w_1000,h_400,c_fill')} alt="cover" className="w-full h-56 object-cover rounded-xl2" />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <label className="bg-white/90 dark:bg-brand-900/80 text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer hover:bg-white transition-colors">
                  📷 Thay đổi ảnh
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => setCoverImage('')}
                  className="bg-white/90 dark:bg-brand-900/80 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  🗑 Xoá
                </button>
              </div>
            </div>
          ) : (
            <label
              onDrop={handleCoverDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-brand-700 rounded-xl2 py-10 cursor-pointer hover:border-brand-300 transition-colors"
            >
              <span className="text-3xl">🖼️</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Kéo &amp; thả ảnh vào đây</span>
              <span className="text-xs text-brand-600 dark:text-brand-300 font-medium">hoặc chọn ảnh từ máy tính</span>
              <span className="text-xs text-gray-400">Định dạng: JPG, PNG, WebP (Tối đa 5MB)</span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Thiết lập khác</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              Cho phép bình luận
              <input type="checkbox" checked={commentsEnabled} onChange={(e) => setCommentsEnabled(e.target.checked)} className="w-5 h-5 accent-brand-500" />
            </label>
            {isAdmin && (
              <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                Đặt làm bài viết nổi bật
                <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-5 h-5 accent-brand-500" />
              </label>
            )}
            <label className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              🔒 Bài viết riêng tư
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="w-5 h-5 accent-brand-500" />
            </label>
          </div>
          {isPrivate && (
            <p className="text-xs text-gray-400 mt-2">Chỉ bạn và quản trị viên có thể xem bài viết này.</p>
          )}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      <div className="space-y-5">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            {isAdmin ? 'Đăng bài' : 'Gửi bài viết'}
          </h3>
          {!isAdmin && quota && !quota.unlimited && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Còn <span className="font-semibold text-brand-600">{quota.remaining}</span>/{quota.limit} lượt gửi duyệt trong tháng này.
            </p>
          )}
          <div className="flex gap-2 mb-3">
            <button onClick={() => handleSubmit('DRAFT')} disabled={submitting} className="btn-outline flex-1 text-sm">
              Lưu nháp
            </button>
            <button type="button" onClick={() => setShowPreview(true)} className="btn-outline flex-1 text-sm">
              👁 Xem trước
            </button>
          </div>
          <button
            onClick={() => handleSubmit(isAdmin ? 'PUBLISHED' : 'PENDING')}
            disabled={submitting || (!isAdmin && !!quota && !quota.unlimited && quota.remaining <= 0)}
            className="btn-primary w-full text-sm"
          >
            {submitting ? 'Đang xử lý...' : isAdmin ? '📤 Đăng bài' : '📨 Gửi duyệt'}
          </button>
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
            <p>Trạng thái: <span className="font-medium text-gray-700 dark:text-gray-200">
              {{ DRAFT: 'Nháp', PENDING: 'Chờ duyệt', PUBLISHED: 'Đã đăng', REJECTED: 'Bị từ chối' }[initial?.status as string] || 'Nháp'}
            </span></p>
            <p>Hiển thị: <span className="font-medium text-gray-700 dark:text-gray-200">
              {isPrivate ? 'Riêng tư (chỉ bạn & admin)' : 'Công khai'}
            </span></p>
          </div>
        </div>


        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Chuyên mục</h3>
          <div className="space-y-2">
            {allTags.map((t) => (
              <label key={t.id} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={selectedCategories.has(t.name)} onChange={() => toggleCategory(t.name)} className="w-4 h-4 accent-brand-500" />
                {t.name}
              </label>
            ))}
            {allTags.length === 0 && <p className="text-xs text-gray-400">Chưa có chuyên mục nào.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Thẻ (Tags)</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {extraTags.map((t) => (
              <span key={t} className="flex items-center gap-1 text-xs bg-brand-50 dark:bg-brand-800 text-brand-700 dark:text-brand-300 px-2.5 py-1 rounded-full">
                #{t}
                <button type="button" onClick={() => setExtraTags((prev) => prev.filter((x) => x !== t))} className="hover:text-red-500">✕</button>
              </span>
            ))}
          </div>
          <input
            value={extraTagsInput}
            onChange={(e) => setExtraTagsInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addExtraTag();
              }
            }}
            placeholder="Nhập thẻ và nhấn Enter..."
            className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tóm tắt bài viết</h3>
            <span className="text-xs text-gray-400">{excerpt.length}/200</span>
          </div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
            rows={4}
            placeholder="Viết một đoạn tóm tắt ngắn gọn về bài viết..."
            className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-3 py-2 text-sm focus:border-brand-400 focus:outline-none resize-none"
          />
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white dark:bg-brand-900 rounded-xl2 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPreview(false)} className="float-right text-gray-400 hover:text-gray-600">✕</button>
            <h1 className="font-display text-2xl font-bold mb-4 dark:text-white">{title || 'Chưa có tiêu đề'}</h1>
            {coverImage && <img src={cldOptimize(coverImage, 'w_1000,h_400,c_fill')} alt="" className="w-full rounded-xl2 mb-5" />}
            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      )}
    </div>
  );
}