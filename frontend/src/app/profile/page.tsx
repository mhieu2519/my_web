'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { uploadToCloudinary } from '@/lib/upload';

export default function ProfilePage() {
    const { user, loading, refreshMe } = useAuth();
    const router = useRouter();
    const [name, setName] = useState(user?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);

    if (loading) return <p className="text-gray-400">Đang tải...</p>;
    if (!user) {
        router.push('/login');
        return null;
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = await uploadToCloudinary(file, 'avatars');
        setAvatarUrl(url);
    }

    async function handleSave() {
        setError('');
        setMessage('');
        setSubmitting(true);
        try {
            await api.patch('/users/me', { name, avatarUrl });
            await refreshMe();
            setMessage('Đã lưu thay đổi.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResendVerification() {
        setResending(true);
        try {
            await api.post('/auth/resend-verification');
            setMessage('Đã gửi lại email xác thực.');
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto card p-8 space-y-5">
            <h1 className="text-2xl font-bold heading-gradient inline-block">Hồ sơ cá nhân</h1>

            {user.emailVerified === false && (
                <div className="bg-amber-50 border-2 border-amber-200 text-amber-800 text-sm p-3 rounded-xl flex items-center justify-between">
                    <span>Email chưa được xác thực.</span>
                    <button
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="underline disabled:opacity-50 font-medium"
                    >
                        {resending ? 'Đang gửi...' : 'Gửi lại'}
                    </button>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Ảnh đại diện</label>
                <div className="flex items-center gap-4">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover ring-4 ring-brand-100" />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-brand-gradient" />
                    )}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="text-sm" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Tên hiển thị</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                <input value={user.email} disabled className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-500" />
            </div>

            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button onClick={handleSave} disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
        </div>
    );
}