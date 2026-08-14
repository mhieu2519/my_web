'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getGoogleLoginUrl, getGithubLoginUrl } from '@/lib/api-client';
import { FaGithub } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { IoPeopleOutline } from "react-icons/io5";
import { LuPencilLine } from "react-icons/lu";
import { RiLeafLine } from "react-icons/ri";


const PLACEHOLDER_IMG = '/images/pic2.png';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!agree) {
      setError('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, name);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-mx-4 md:-mx-[calc((64rem-48rem)/2)]">
      <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-16 overflow-hidden">
        <img src={PLACEHOLDER_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 dark:bg-brand-900/75 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-1 heading-gradient inline-block">Tạo tài khoản mới 🌿</h1>
            <p className="text-sm text-gray-400 mb-6">Tham gia cộng đồng Lặng 24 ngay hôm nay</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Họ và tên</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Mật khẩu (tối thiểu 8 ký tự)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-4 py-2.5 pr-11 focus:border-brand-400 focus:outline-none transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Hiện/ẩn mật khẩu">
                    {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Xác nhận mật khẩu</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
                />
              </div>

              <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="w-4 h-4 mt-0.5 accent-brand-500" />
                <span>
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-brand-600 dark:text-brand-300 hover:underline">Điều khoản sử dụng</Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-brand-600 dark:text-brand-300 hover:underline">Chính sách bảo mật</Link>
                </span>
              </label>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Đang tạo...' : 'Đăng ký →'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-brand-700" />
              <span className="text-xs text-gray-400">hoặc đăng ký với</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-brand-700" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a href={getGoogleLoginUrl()} className="flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-brand-700 rounded-full py-2.5 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors text-sm font-medium">
                <FcGoogle size={18} /> Google
              </a>
              <a href={getGithubLoginUrl()} className="flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-brand-700 rounded-full py-2.5 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors text-sm font-medium dark:text-gray-200">
                <FaGithub size={18} /> Github
              </a>
            </div>

            <p className="text-center text-sm mt-6 text-gray-500 dark:text-gray-400">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-brand-600 dark:text-brand-300 font-medium hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 py-8 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5 "><IoPeopleOutline /> Kết nối &amp; chia sẻ cùng cộng đồng</span>
        <span className="flex items-center gap-1.5 "><LuPencilLine /> Lưu giữ hành trình và cảm xúc của bạn</span>
        <span className="flex items-center gap-1.5 "><RiLeafLine /> Truyền cảm hứng mỗi ngày</span>
      </div>
    </div>
  );
}