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
        <div className="max-w-lg mx-auto">
            {/* Banner + avatar nổi */}
            <div className="card overflow-hidden">
                <div className="h-32 bg-brand-gradient" />
                <div className="px-8 pb-8">
                    <div className="-mt-10 flex items-end justify-between">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-card"
                            />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-brand-gradient ring-4 ring-white shadow-card flex items-center justify-center text-white text-2xl font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <label className="text-xs font-medium text-brand-600 hover:underline cursor-pointer mb-2">
                            Đổi ảnh
                            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                    </div>

                    <h1 className="font-display text-xl font-bold text-gray-900 mt-3">{user.name}</h1>
                    <p className="text-sm text-gray-400">{user.email}</p>

                    {user.emailVerified === false && (
                        <div className="mt-4 bg-amber-50 border-2 border-amber-200 text-amber-800 text-sm p-3 rounded-xl flex items-center justify-between">
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
                </div>
            </div>

            {/* Form chỉnh sửa */}
            <div className="card p-8 mt-6 space-y-5">
                <h2 className="text-sm font-bold text-gray-800">Thông tin hồ sơ</h2>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Tên hiển thị</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                    <input value={user.email} disabled className="w-full border-2 border-brand-50 rounded-xl px-4 py-2.5 bg-brand-50/60 text-gray-500" />
                </div>

                {message && <p className="text-brand-700 text-sm">{message}</p>}
                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button onClick={handleSave} disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </div>
    );
}