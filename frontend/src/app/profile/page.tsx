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

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [pwSubmitting, setPwSubmitting] = useState(false);
    const [pwError, setPwError] = useState('');
    const { logout } = useAuth();

    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [twoFABusy, setTwoFABusy] = useState(false);
    const [twoFAError, setTwoFAError] = useState('');

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

    async function handleChangePassword() {
        setPwError('');
        if (newPassword !== confirmNewPassword) {
            setPwError('Mật khẩu mới xác nhận không khớp');
            return;
        }
        setPwSubmitting(true);
        try {
            await api.patch('/auth/change-password', { currentPassword, newPassword });
            alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
            await logout();
            router.push('/login');
        } catch (err: any) {
            setPwError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setPwSubmitting(false);
        }
    }

    async function startSetup2FA() {
        setTwoFAError('');
        setTwoFABusy(true);
        try {
            const res = await api.post('/auth/2fa/setup');
            setQrDataUrl(res.data.qrDataUrl);
            setShow2FASetup(true);
        } catch (err: any) {
            setTwoFAError(err.response?.data?.message || 'Không thể khởi tạo 2FA');
        } finally {
            setTwoFABusy(false);
        }
    }

    async function confirmSetup2FA() {
        setTwoFAError('');
        setTwoFABusy(true);
        try {
            await api.post('/auth/2fa/confirm', { code: twoFACode });
            setShow2FASetup(false);
            setTwoFACode('');
            setQrDataUrl('');
            await refreshMe();
            setMessage('Đã bật xác thực 2 lớp.');
        } catch (err: any) {
            setTwoFAError(err.response?.data?.message || 'Mã xác thực không đúng');
        } finally {
            setTwoFABusy(false);
        }
    }

    async function disable2FA() {
        if (!confirm('Tắt xác thực 2 lớp? Tài khoản sẽ kém an toàn hơn.')) return;
        setTwoFABusy(true);
        try {
            await api.post('/auth/2fa/disable');
            await refreshMe();
            setMessage('Đã tắt xác thực 2 lớp.');
        } finally {
            setTwoFABusy(false);
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

            <div className="card p-8 mt-6 space-y-5 bg-transparent">
                <h2 className="text-sm font-bold text-gray-800">Thông tin hồ sơ</h2>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Tên hiển thị</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors bg-transparent" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                    <input value={user.email} disabled className="w-full border-2 border-brand-50 rounded-xl px-4 py-2.5 bg-brand-50/60 text-gray-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Giới thiệu ngắn (bio)</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} placeholder="Yêu công nghệ, thích du lịch và những điều đẹp đẽ..." className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors resize-none bg-transparent" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Địa điểm</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hà Nội, Việt Nam" className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors " />
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

            <div className="card p-8 mt-6 space-y-5 bg-transparent">
                <h2 className="text-sm font-bold text-gray-800">Đổi mật khẩu</h2>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu hiện tại</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Mật khẩu mới (tối thiểu 8 ký tự)</label>
                    <input type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Xác nhận mật khẩu mới</label>
                    <input type="password" minLength={8} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full border-2 border-brand-100 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none" />
                </div>
                {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
                <button onClick={handleChangePassword} disabled={pwSubmitting} className="btn-primary w-full">
                    {pwSubmitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
                </button>
            </div>

            <div className="card p-8 mt-6 space-y-4 bg-transparent">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-gray-800">Xác thực 2 lớp (2FA)</h2>
                        <p className="text-xs text-gray-400 mt-1">
                            Tăng bảo mật tài khoản bằng mã xác thực từ ứng dụng như Google Authenticator.
                        </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${user.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.twoFactorEnabled ? 'Đang bật' : 'Đang tắt'}
                    </span>
                </div>

                {user.twoFactorEnabled ? (
                    <button onClick={disable2FA} disabled={twoFABusy} className="btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50">
                        Tắt xác thực 2 lớp
                    </button>
                ) : (
                    <button onClick={startSetup2FA} disabled={twoFABusy} className="btn-primary text-sm">
                        {twoFABusy ? 'Đang tạo mã...' : 'Bật xác thực 2 lớp'}
                    </button>
                )}
            </div>

            {show2FASetup && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShow2FASetup(false)}>
                    <div className="bg-white dark:bg-brand-900 rounded-xl2 max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-3">Quét mã QR</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Mở Google Authenticator (hoặc Authy...), chọn "Quét mã QR" và quét ảnh bên dưới.
                        </p>
                        {qrDataUrl && <img src={qrDataUrl} alt="QR code 2FA" className="mx-auto mb-4 w-48 h-48" />}
                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Nhập mã 6 số để xác nhận</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={twoFACode}
                            onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-center text-xl tracking-[0.4em] border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none mb-2"
                        />
                        {twoFAError && <p className="text-red-600 text-sm mb-2">{twoFAError}</p>}
                        <div className="flex gap-2">
                            <button onClick={() => setShow2FASetup(false)} className="btn-outline flex-1 text-sm">Huỷ</button>
                            <button onClick={confirmSetup2FA} disabled={twoFABusy || twoFACode.length !== 6} className="btn-primary flex-1 text-sm">
                                {twoFABusy ? 'Đang xác nhận...' : 'Xác nhận'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}