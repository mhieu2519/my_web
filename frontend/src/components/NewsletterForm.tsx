'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        setStatus('submitting');
        try {
            await api.post('/newsletter/subscribe', { email });
            setStatus('done');
            setEmail('');
        } catch {
            setStatus('idle');
        }
    }

    if (status === 'done') {
        return <p className="text-sm text-brand-700 dark:text-brand-300">Cảm ơn bạn đã đăng ký! 🌿</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-900 rounded-full px-4 py-2 text-sm focus:border-brand-400 focus:outline-none transition-colors bg-transparent"
            />
            <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full text-sm">
                {status === 'submitting' ? 'Đang gửi...' : 'Đăng ký ngay'}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500">Không spam. Hủy đăng ký bất kỳ lúc nào.</p>
        </form>
    );
}