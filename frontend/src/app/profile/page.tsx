'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api-client';
import { uploadToCloudinary } from '@/lib/upload';
import { cldOptimize } from '@/lib/cloudinary';

export default function ProfilePage() {
    const { user, loading, refreshMe } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [githubUrl, setGithubUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setAvatarUrl(user.avatarUrl || '');
            setBio(user.bio || '');
            setLocation(user.location || '');
            setWebsiteUrl(user.websiteUrl || '');
            setFacebookUrl(user.facebookUrl || '');
            setInstagramUrl(user.instagramUrl || '');
            setGithubUrl(user.githubUrl || '');
        }
    }, [user]);

    if (loading) return <p className="text-gray-400">Đang tải...</p>;
    if (!user) {
        router.push('/login');
        return null;
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const url = await uploadToCloudinary(file, 'avatars');
            setAvatarUrl(url);
        } catch (err: any) {
            setError(err.message || 'Tải ảnh lên thất bại.');
        }
    }

    async function handleSave() {
        setError('');
        setMessage('');
        setSubmitting(true);
        try {
            await api.patch('/users/me', {
                name, avatarUrl, bio, location, websiteUrl, facebookUrl, instagramUrl, githubUrl,
            });
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
            <div className="card overflow-hidden">
                <div className="h-32 bg-brand-gradient" />
                <div className="px-8 pb-8">
                    <div className="-mt-10 flex items-end justify-between">
                        {avatarUrl ? (
                            <img src={cldOptimize(avatarUrl, 'w_80,h_80,c_fill,g_auto')} alt="avatar" className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-card" />
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
                    <Link href={`/authors/${user.id}`} className="text-sm text-brand-600 hover:underline mt-1 inline-block">
                        Xem trang cá nhân công khai →
                    </Link>

                    {user.emailVerified === false && (
                        <div className="mt-4 bg-amber-50 border-2 border-amber-200 text-amber-800 text-sm p-3 rounded-xl flex items-center justify-between">
                            <span>Email chưa được xác thực.</span>
                            <button onClick={handleResendVerification} disabled={resending} className="underline disabled:opacity-50 font-medium">
                                {resending ? 'Đang gửi...' : 'Gửi lại'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="card p-8 mt-6 space-y-5">
                <h2 className="text-sm font-bold text-gray-800">Thông tin hồ sơ</h2>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Tên hiển thị</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                    <input value={user.email} disabled className="w-full border-2 border-brand-50 rounded-xl px-4 py-2.5 bg-brand-50/60 text-gray-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Giới thiệu ngắn (bio)</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} placeholder="Yêu công nghệ, thích du lịch và những điều đẹp đẽ..." className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors resize-none" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Địa điểm</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hà Nội, Việt Nam" className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500">Website</label>
                        <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." className="w-full border-2 border-brand-100 rounded-xl px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500">Facebook</label>
                        <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." className="w-full border-2 border-brand-100 rounded-xl px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500">Instagram</label>
                        <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="w-full border-2 border-brand-100 rounded-xl px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500">Github</label>
                        <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="w-full border-2 border-brand-100 rounded-xl px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
                    </div>
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