'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api-client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto card p-8">
            <h1 className="text-2xl font-bold mb-1 heading-gradient inline-block">Quên mật khẩu</h1>
            <p className="text-sm text-gray-400 mb-6">Đừng lo, ai cũng có lúc quên 🔑</p>

            {sent ? (
                <p className="text-gray-600 leading-relaxed">
                    Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu. Hãy kiểm tra hộp thư (kể cả spam).
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary w-full">
                        {submitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                    </button>
                </form>
            )}

            <div className="mt-5 text-sm text-center">
                <Link href="/login" className="text-brand-600 hover:underline">
                    ← Quay lại đăng nhập
                </Link>
            </div>
        </div>
    );
}