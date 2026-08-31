'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getGoogleLoginUrl, getGithubLoginUrl } from '@/lib/api-client';
import { FaGithub } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { LuShieldCheck } from "react-icons/lu";
import { CiLock } from "react-icons/ci";
import { FaRegHeart } from "react-icons/fa";

const PLACEHOLDER_IMG = '/images/pic1.png';

export default function LoginPage() {
  const { login, verify2FA } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'password' | '2fa'>('password');
  const [tempToken, setTempToken] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (result.requires2FA) {
        setTempToken(result.tempToken!);
        setStep('2fa');
        return;
      }
      remember ? localStorage.setItem('rememberedEmail', email) : localStorage.removeItem('rememberedEmail');
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify2FA(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await verify2FA(tempToken, twoFACode);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="-mx-4 md:-mx-[calc((64rem-48rem)/2)]">
      <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-16 overflow-hidden">
        <img src={PLACEHOLDER_IMG} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/70 dark:bg-brand-900/75 backdrop-blur-[2px]" />

        <div className="relative z-10 w-full max-w-md">
          <div className="card p-8 bg-transparent">
            {step === 'password' ? (
              <>
                <h1 className="text-2xl font-bold mb-1 heading-gradient inline-block">Chào mừng quay trở lại!</h1>
                <p className="text-sm text-gray-400 mb-6">Đăng nhập để tiếp tục hành trình cùng Lặng 24</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Mật khẩu</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-4 py-2.5 pr-11 focus:border-brand-400 focus:outline-none transition-colors bg-transparent"
                      />
                      <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Hiện/ẩn mật khẩu">
                        {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 accent-brand-500" />
                      Ghi nhớ đăng nhập
                    </label>
                    <Link href="/forgot-password" className="text-brand-600 dark:text-brand-300 hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    {submitting ? 'Đang đăng nhập...' : 'Đăng nhập →'}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-brand-700" />
                  <span className="text-xs text-gray-400">hoặc đăng nhập với</span>
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
                  Chưa có tài khoản?{' '}
                  <Link href="/register" className="text-brand-600 dark:text-brand-300 font-medium hover:underline">
                    Đăng ký ngay
                  </Link>
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setStep('password'); setError(''); setTwoFACode(''); }}
                  className="text-sm text-gray-400 hover:text-gray-600 mb-3"
                >
                  ← Quay lại
                </button>
                <h1 className="text-2xl font-bold mb-1 heading-gradient inline-block">Xác thực 2 lớp</h1>
                <p className="text-sm text-gray-400 mb-6">
                  Mở ứng dụng xác thực (Google Authenticator, Authy...) và nhập mã 6 số hiện tại.
                </p>
                <form onSubmit={handleVerify2FA} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-200">Mã xác thực</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      autoFocus
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full text-center text-2xl tracking-[0.5em] border-2 border-gray-200 dark:border-brand-700 dark:bg-brand-800 rounded-xl px-4 py-3 focus:border-brand-400 focus:outline-none transition-colors"
                    />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <button type="submit" disabled={submitting || twoFACode.length !== 6} className="btn-primary w-full">
                    {submitting ? 'Đang xác thực...' : 'Xác nhận →'}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="card mt-6 p-5 text-center bg-transparent">
            <p className="italic text-gray-600 dark:text-gray-300">
              "Những điều đẹp nhất thường bắt đầu từ những điều rất nhỏ bé."
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 py-8 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5 "><LuShieldCheck /> Bảo mật tuyệt đối dữ liệu của bạn</span>
        <span className="flex items-center gap-1.5 "><CiLock /> Không chia sẻ thông tin cá nhân</span>
        <span className="flex items-center gap-1.5 "><FaRegHeart /> Cộng đồng tích cực và truyền cảm hứng</span>
      </div>
    </div>
  );
}