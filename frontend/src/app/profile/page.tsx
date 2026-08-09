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
        <div className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h1 className="text-xl font-semibold">Hồ sơ cá nhân</h1>

            {user.emailVerified === false && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded flex items-center justify-between">
                    <span>Email chưa được xác thực.</span>
                    <button
                        onClick={handleResendVerification}
                        disabled={resending}
                        className="underline disabled:opacity-50"
                    >
                        {resending ? 'Đang gửi...' : 'Gửi lại'}
                    </button>
                </div>
            )}

            <div>
                <label className="block text-sm mb-1">Ảnh đại diện</label>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
                {avatarUrl && (
                    <img src={avatarUrl} alt="avatar" className="mt-2 h-20 w-20 rounded-full object-cover" />
                )}
            </div>

            <div>
                <label className="block text-sm mb-1">Tên hiển thị</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm mb-1">Email</label>
                <input value={user.email} disabled className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-500" />
            </div>

            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
                onClick={handleSave}
                disabled={submitting}
                className="w-full bg-brand text-white rounded py-2 hover:bg-brand-dark disabled:opacity-50"
            >
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
        </div>
    );
}