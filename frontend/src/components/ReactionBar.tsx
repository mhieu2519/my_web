'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

const ICONS: Record<string, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  HAHA: '😆',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡',
};

type Summary = { counts: Record<string, number>; total: number; myReaction: string | null };

export default function ReactionBar({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Summary>({ counts: {}, total: 0, myReaction: null });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/reactions?postId=${postId}`).then((res) => setSummary(res.data));
  }, [postId]);

  async function handleClick(type: string) {
    if (!user || busy) return;
    setBusy(true);

    // optimistic update
    const prev = summary;
    const wasMine = summary.myReaction === type;
    const newCounts = { ...summary.counts };
    if (summary.myReaction) newCounts[summary.myReaction] = Math.max(0, (newCounts[summary.myReaction] || 1) - 1);
    if (!wasMine) newCounts[type] = (newCounts[type] || 0) + 1;
    setSummary({
      counts: newCounts,
      total: wasMine ? summary.total - 1 : summary.myReaction ? summary.total : summary.total + 1,
      myReaction: wasMine ? null : type,
    });

    try {
      const res = await api.post('/reactions/toggle', { postId, type });
      setSummary(res.data);
    } catch {
      setSummary(prev); // rollback nếu lỗi
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(ICONS).map(([type, icon]) => (
        <button
          key={type}
          onClick={() => handleClick(type)}
          disabled={!user}
          title={user ? '' : 'Đăng nhập để thả cảm xúc'}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${summary.myReaction === type
              ? 'bg-brand-gradient text-white border-transparent shadow-card'
              : 'bg-white border-gray-200 hover:border-brand-300'
            } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span>{icon}</span>
          {summary.counts[type] ? <span>{summary.counts[type]}</span> : null}
        </button>
      ))}
      <span className="text-sm text-gray-400 ml-2">{summary.total} lượt cảm xúc</span>
    </div>
  );
}
