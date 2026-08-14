'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { slugify } from '@/lib/slugify';
import {
  IoLogOutOutline,
  IoCreateOutline,
} from 'react-icons/io5';
import { CgProfile } from 'react-icons/cg';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import { FiMenu } from 'react-icons/fi';
import { FcAbout } from "react-icons/fc";
import { IoMdLogIn } from 'react-icons/io';
import { AiOutlineTags } from 'react-icons/ai';
import { FcSearch } from "react-icons/fc";
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Công nghệ', href: `/tags/${slugify('Công nghệ')}` },
  { label: 'Thơ ca', href: `/tags/${slugify('Thơ ca')}` },
  { label: 'Du ký', href: `/tags/${slugify('Du ký')}` },
  { label: 'Du lịch', href: `/tags/${slugify('Du lịch')}` },
  { label: 'Đời sống', href: `/tags/${slugify('Đời sống')}` },
  { label: 'Cảm hứng', href: `/tags/${slugify('Cảm hứng')}` },
];

export default function Header() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSmallMenu, setOpenSmallMenu] = useState(false);
  const smallMenuRef = useRef<HTMLDivElement>(null);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = saved ? saved === 'dark' : prefersDark;
    setDark(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(false);
      }
      if (smallMenuRef.current && !smallMenuRef.current.contains(event.target as Node)) {
        setOpenSmallMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cream/85 dark:bg-brand-900/85 border-b border-brand-100 dark:border-brand-800">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-2 shrink-0 font-script text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          <img src="/logo.png" alt="logo" className="w-9 h-9 object-contain" />
          <span>
            Lặng<span className="font-script text-2xl text-brand-600 dark:text-brand-300 ml-0.5">24</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1 border-b-2 transition-colors ${active ? 'border-brand-500 text-brand-700 dark:text-brand-300' : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-300'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

          <Link
            href="/search"
            className="p-2 rounded-full hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors flex items-center justify-center"
            aria-label="Tìm kiếm"
          >
            <FcSearch size={22} />
          </Link>

          <button
            onClick={toggleDark}
            className="p-2 rounded-full hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-200"
            aria-label="Đổi giao diện sáng/tối"
          >
            {dark ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} />}
          </button>

          <div className="relative" ref={smallMenuRef}>
            <button
              onClick={() => setOpenSmallMenu(!openSmallMenu)}
              className="p-2 rounded-full hover:bg-brand-50 dark:hover:bg-brand-800 text-gray-600 dark:text-gray-200 transition-colors flex items-center justify-center md:hidden"
              aria-label="Menu"
            >
              <FiMenu size={20} />
            </button>

            {openSmallMenu && (
              <div className="absolute right-0 mt-2 w-52 card p-1.5 z-50 shadow-lg rounded-xl border border-brand-100 dark:border-brand-700">

                {/*  }
                <div className="h-px bg-brand-100 dark:bg-brand-700 my-1" />
                */}

                <Link
                  href={`/tags/${slugify('Công nghệ')}`}
                  onClick={() => setOpenSmallMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-gray-500 dark:text-gray-400"
                >
                  Công nghệ
                </Link>
                <Link
                  href={`/tags/${slugify('Thơ ca')}`}
                  onClick={() => setOpenSmallMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-gray-500 dark:text-gray-400"
                >
                  Thơ ca
                </Link>

                <Link
                  href={`/tags/${slugify('Du ký')}`}
                  onClick={() => setOpenSmallMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-gray-500 dark:text-gray-400"
                >
                  Du ký
                </Link>

                <Link
                  href={`/tags/${slugify('Du lịch')}`}
                  onClick={() => setOpenSmallMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-gray-500 dark:text-gray-400"
                >
                  Du lịch
                </Link>

                <Link
                  href={`/tags/${slugify('Đời sống')}`}
                  onClick={() => setOpenSmallMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-gray-500 dark:text-gray-400"
                >
                  Đời sống
                </Link>

                <Link
                  href={`/tags/${slugify('Cảm hứng')}`}
                  onClick={() => setOpenSmallMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-gray-500 dark:text-gray-400"
                >
                  Cảm hứng
                </Link>

              </div>
            )}
          </div>

          {loading ? null : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:opacity-80 transition-opacity"
              >
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-brand-100 dark:ring-brand-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
                  {user.name}
                </span>
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-56 card p-1.5 z-50 shadow-lg rounded-xl border border-brand-100 dark:border-brand-700">
                  <Link
                    href="/profile"
                    onClick={() => setOpenMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-gray-700 dark:text-gray-200"
                  >
                    <CgProfile className="text-brand-500" />
                    Hồ sơ
                  </Link>

                  {user.role === 'ADMIN' && (
                    <>
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setOpenMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-brand-600 dark:text-brand-300 font-medium"
                      >
                        <MdOutlineAdminPanelSettings />
                        Quản trị
                      </Link>
                      <Link
                        href="/admin/posts/new"
                        onClick={() => setOpenMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-700 text-sm text-gray-700 dark:text-gray-200"
                      >
                        <IoCreateOutline />
                        Viết bài mới
                      </Link>
                    </>
                  )}

                  <div className="h-px bg-brand-100 dark:bg-brand-700 my-1.5" />

                  <button
                    onClick={() => {
                      setOpenMenu(false);
                      logout();
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-sm text-red-600 dark:text-red-400"
                  >
                    <IoLogOutOutline />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-gradient text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <IoMdLogIn size={18} />
              <span className="hidden sm:inline">Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}