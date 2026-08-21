'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';

export default function FollowButton({
    authorId,
    initialCount,
}: {
    authorId: number;
    initialCount: number;
}) {
    const { user } = useAuth();
    const router = useRouter();
    const [following, setFollowing] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [busy, setBusy] = useState(false);

    // Lấy đúng trạng thái "đang theo dõi" phía client (server render không biết ai đang đăng nhập)
    useEffect(() => {
        if (!user || user.id === authorId) return;
        api.get(`/users/${authorId}/public`).then((res) => setFollowing(res.data.isFollowing)).catch(() => { });
    }, [user, authorId]);

    if (user?.id === authorId) return null;

    async function handleClick() {
        if (!user) {
            router.push('/login');
            return;
        }
        if (busy) return;
        setBusy(true);
        const prev = following;
        setFollowing(!prev);
        setCount((c) => (prev ? c - 1 : c + 1));
        try {
            const res = await api.post(`/users/${authorId}/follow/toggle`);
            setFollowing(res.data.following);
        } catch {
            setFollowing(prev);
            setCount((c) => (prev ? c + 1 : c - 1));
        } finally {
            setBusy(false);
        }
    }

    return (
        <button onClick={handleClick} disabled={busy} className={following ? 'btn-outline text-sm' : 'btn-primary text-sm'}>
            {following ? 'Đang theo dõi' : '+ Theo dõi'}
        </button>
    );
}