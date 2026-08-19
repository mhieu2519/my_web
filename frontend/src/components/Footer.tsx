import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaPinterestP, FaXTwitter, FaGithub, FaYoutube } from 'react-icons/fa6';

const COLUMN_LINKS = [
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Liên hệ', href: '/contact' },
    { label: 'Điều khoản', href: '/terms' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
];

export default function Footer() {
    return (
        <footer className="bg-brand-50 dark:bg-brand-900 border-t border-brand-100 dark:border-brand-800 mt-16 py-8">
            <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">

                {/* Khối bên trái: Logo + Tagline */}
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
                    <Link href="/" className="font-script text-3xl font-bold text-gray-900 dark:text-white">
                        Lặng<span className="font-script text-2xl text-brand-600 dark:text-brand-300 ml-0.5">24</span>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Viết để lưu giữ. Sống để yêu thương.
                    </p>
                </div>

                {/* Khối ở giữa: Icon mạng xã hội tròn */}
                <div className="flex items-center gap-3">
                    <a
                        href="https://www.youtube.com/@hieunm2519"
                        aria-label="YouTube"
                        className="w-9 h-9 rounded-full border border-brand-200 dark:border-brand-700/60 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-600 dark:hover:border-brand-300 transition-colors"
                    >
                        <FaYoutube size={15} />
                    </a>

                    <a
                        href="https://www.instagram.com/hnm_241"
                        aria-label="Instagram"
                        className="w-9 h-9 rounded-full border border-brand-200 dark:border-brand-700/60 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-600 dark:hover:border-brand-300 transition-colors"
                    >
                        <FaInstagram size={15} />
                    </a>
                    <a
                        href="https://www.pinterest.com/minhhieu00"
                        aria-label="Pinterest"
                        className="w-9 h-9 rounded-full border border-brand-200 dark:border-brand-700/60 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-600 dark:hover:border-brand-300 transition-colors"
                    >
                        <FaPinterestP size={14} />
                    </a>
                    <a
                        href="https://x.com/minhhieuhd"
                        aria-label="X / Twitter"
                        className="w-9 h-9 rounded-full border border-brand-200 dark:border-brand-700/60 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-600 dark:hover:border-brand-300 transition-colors"
                    >
                        <FaXTwitter size={14} />
                    </a>
                    <a
                        href="#"
                        aria-label="Github"
                        className="w-9 h-9 rounded-full border border-brand-200 dark:border-brand-700/60 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-300 hover:border-brand-600 dark:hover:border-brand-300 transition-colors"
                    >
                        <FaGithub size={15} />
                    </a>
                </div>

                {/* Khối bên phải: Các đường link + Copyright */}
                <div className="flex flex-col items-center lg:items-end gap-2">
                    <nav className="flex flex-wrap justify-center lg:justify-end gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                        {COLUMN_LINKS.map((l) => (
                            <Link key={l.href} href={l.href} className="hover:text-brand-600 dark:hover:text-brand-300 transition-colors">
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        &copy; 2022–{new Date().getFullYear()} Lặng 24. All rights reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
}