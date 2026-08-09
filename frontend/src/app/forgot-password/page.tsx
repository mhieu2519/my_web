'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-xl font-semibold mb-4">Quên mật khẩu</h1>

            {sent ? (
                <p className="text-gray-600">
                    Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu. Hãy kiểm tra hộp thư (kể cả spam).
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-brand text-white rounded py-2 hover:bg-brand-dark disabled:opacity-50"
                    >
                        {submitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                    </button>
                </form>
            )}
        </div>
    );
}