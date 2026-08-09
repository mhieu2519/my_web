'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg text-brand">
          Lặng lẽ 24
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {loading ? null : user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin/dashboard" className="hover:text-brand">
                  Quản trị
                </Link>
              )}
              <Link href="/profile" className="hover:text-brand">
                Xin chào, {user.name}
              </Link>
              <button onClick={() => logout()} className="text-red-600 hover:underline">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-brand">
                Đăng nhập
              </Link>
              <Link href="/register" className="hover:text-brand">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}