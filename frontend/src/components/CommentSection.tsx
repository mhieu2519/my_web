'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
  replies: Comment[];
};

function CommentItem({
  comment,
  postId,
  onReplyPosted,
  depth = 0,
}: {
  comment: Comment;
  postId: string;
  onReplyPosted: () => void;
  depth?: number;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitReply() {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/comments', { postId, content, parentId: comment.id });
      setContent('');
      setReplying(false);
      onReplyPosted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={depth > 0 ? 'ml-6 border-l-2 border-brand-100 pl-4 mt-3' : 'mt-4'}>
      <div className="card p-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-800">{comment.author.name}</span>
          <span className="text-gray-400 text-xs">{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <p className="mt-1.5 text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
        {user && (
          <button
            onClick={() => setReplying((r) => !r)}
            className="text-xs text-brand-600 mt-2 hover:underline font-medium"
          >
            Trả lời
          </button>
        )}
        {replying && (
          <div className="mt-3 flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết phản hồi..."
              className="flex-1 border-2 border-gray-200 rounded-full px-4 py-1.5 text-sm focus:border-brand-400 focus:outline-none"
            />
            <button
              onClick={submitReply}
              disabled={submitting}
              className="btn-primary !px-4 !py-1.5 text-sm"
            >
              Gửi
            </button>
          </div>
        )}
      </div>
      {comment.replies?.map((r) => (
        <CommentItem key={r.id} comment={r} postId={postId} onReplyPosted={onReplyPosted} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await api.get(`/comments?postId=${postId}`);
    setComments(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [postId]);

  async function submitComment() {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/comments', { postId, content });
      setContent('');
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold mb-4">Bình luận</h3>

      {user ? (
        <div className="flex gap-2 mb-6">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận của bạn..."
            className="flex-1 border-2 border-gray-200 rounded-full px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
          />
          <button onClick={submitComment} disabled={submitting} className="btn-primary">
            Gửi
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-6">Đăng nhập để bình luận.</p>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Đang tải bình luận...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có bình luận nào.</p>
      ) : (
        comments.map((c) => <CommentItem key={c.id} comment={c} postId={postId} onReplyPosted={load} />)
      )}
    </div>
  );
}