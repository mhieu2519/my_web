'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

export default function ResetPasswordPage() {
    const params = useParams();
    const token = params.token as string;
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/auth/reset-password', { token, password });
            setDone(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Link không hợp lệ hoặc đã hết hạn');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto card p-8">
            <h1 className="text-2xl font-bold mb-6 heading-gradient inline-block">Đặt lại mật khẩu</h1>

            {done ? (
                <p className="text-green-600">Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu mới (tối thiểu 8 ký tự)</label>
                        <input
                            type="password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <button type="submit" disabled={submitting} className="btn-primary w-full">
                        {submitting ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>
            )}
        </div>
    );
}