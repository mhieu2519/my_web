import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaFacebook, FaInstagram, FaGithub, FaGlobe, FaRegBookmark, FaPencil, FaRegHeart, FaRegEye } from 'react-icons/fa6';
import { IoCheckmarkCircle, IoMailUnreadOutline, IoCalendarOutline } from 'react-icons/io5';
import { PiMapPinLineLight, PiPlantLight } from "react-icons/pi";
import { IconType } from 'react-icons';
import FollowButton from '@/components/FollowButton';
import PostList, { PostSummary } from '@/components/PostList';
import Pagination from '@/components/Pagination';
import { formatCount } from '@/lib/format';
import { slugify } from '@/lib/slugify';
import { cldOptimize } from '@/lib/cloudinary';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const PLACEHOLDER_IMG = '/images/slide3.png';
const PAGE_SIZE = 6;

const CATEGORY_TABS = [
    { label: 'Công nghệ', tag: slugify('Công nghệ') },
    { label: 'Thơ ca', tag: slugify('Thơ ca') },
    { label: 'Du ký', tag: slugify('Du ký') },
    { label: 'Cảm hứng', tag: slugify('Cảm hứng') },
];

type PublicProfile = {
    id: number;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    websiteUrl: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    githubUrl: string | null;
    role: 'ADMIN' | 'USER';
    createdAt: string;
    stats: { postCount: number; totalViews: number; totalLikes: number; followersCount: number };
};

async function getProfile(id: string): Promise<PublicProfile | null> {
    try {
        const res = await fetch(`${API_URL}/users/${id}/public`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

async function getAuthorPosts(authorId: string, tag: string, page: number) {
    try {
        const qs = new URLSearchParams({ authorId, page: String(page), pageSize: String(PAGE_SIZE) });
        if (tag) qs.set('tag', tag);
        const res = await fetch(`${API_URL}/posts?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) return { items: [] as PostSummary[], totalPages: 1 };
        const data = await res.json();
        return { items: data.items as PostSummary[], totalPages: data.totalPages as number };
    } catch {
        return { items: [] as PostSummary[], totalPages: 1 };
    }
}

function StatMini({ icon: Icon, label, value }: { icon: IconType; label: string; value: number }) {
    return (
        <div className="text-center">
            <Icon className="mx-auto text-base mb-1 text-brand-600 dark:text-brand-300" />
            <div className="font-display text-lg font-bold text-gray-900 dark:text-white leading-none">
                {formatCount(value)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">{label}</div>
        </div>
    );
}

export default async function AuthorPage({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { tag?: string; page?: string };
}) {
    const profile = await getProfile(params.id);
    if (!profile) notFound();

    const currentPage = Number(searchParams.page) || 1;
    const activeTag = searchParams.tag || '';
    const { items, totalPages } = await getAuthorPosts(params.id, activeTag, currentPage);

    const joined = new Date(profile.createdAt);
    const joinedLabel = `${String(joined.getMonth() + 1).padStart(2, '0')}/${joined.getFullYear()}`;

    function tabHref(tag: string) {
        const qs = new URLSearchParams();
        if (tag) qs.set('tag', tag);
        const s = qs.toString();
        return `/authors/${params.id}${s ? `?${s}` : ''}`;
    }

    const socialLinks = [
        profile.websiteUrl && { href: profile.websiteUrl, icon: FaGlobe },
        profile.facebookUrl && { href: profile.facebookUrl, icon: FaFacebook },
        profile.instagramUrl && { href: profile.instagramUrl, icon: FaInstagram },
        profile.githubUrl && { href: profile.githubUrl, icon: FaGithub },
    ].filter(Boolean) as { href: string; icon: any }[];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* ========================================================= */}
            {/* TẦNG 1: KHỐI BANNER PHÍA TRÊN (Ảnh bìa, SVG, Avatar & Tên) */}
            {/* ========================================================= */}
            <div className="relative w-full rounded-[2.5rem] bg-cream dark:bg-brand-900">
                {/* 1. Ảnh bìa */}
                <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-[2.5rem] overflow-hidden">
                    <img
                        src={PLACEHOLDER_IMG}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 2. Đường SVG uốn lượn */}
                <div className="hidden md:block absolute -bottom-[1px] left-0 right-0 pointer-events-none z-10">
                    <svg
                        viewBox="0 0 1200 120"
                        className="w-full h-20 md:h-24 text-cream dark:text-brand-900 fill-current"
                        preserveAspectRatio="none"
                    >
                        <path d="M0,120 L0,40 L32,40 A 80,80 0 0 1 192,40 L500,40 C550,40 570,90 620,90 L1200,90 L1200,120 Z" />
                    </svg>
                </div>

                {/* 3. Avatar, Tên & Huy hiệu */}
                <div className="hidden md:flex absolute -bottom-2 left-8 z-20 items-end gap-5">
                    <img
                        src={cldOptimize(profile.avatarUrl || PLACEHOLDER_IMG, 'w_250,h_250,c_fill,g_auto')}
                        alt={profile.name}
                        className="w-36 h-36 lg:w-40 lg:h-40 rounded-full object-cover ring-8 ring-cream dark:ring-brand-900 bg-cream dark:bg-brand-900 shadow-md"
                    />

                    <div className="pb-3">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {profile.name}
                            </h1>
                            {profile.role === 'ADMIN' && (
                                <IoCheckmarkCircle className="text-brand-500 shrink-0" size={20} />
                            )}
                        </div>
                        <span className="mt-1 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                            Tác giả tại Lặng 24 🌿
                        </span>
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* TẦNG 2: KHỐI NỘI DUNG PHÍA DƯỚI (Dùng Grid 12 cột)         */}
            {/* ========================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2 sm:px-4 mt-8">

                {/* CỘT TRÁI (5 cột): Bio, Social Links & Action Buttons */}
                <div className="lg:col-span-5 flex flex-col justify-start pt-2">

                    {/* Responsive cho Mobile (Hiển thị Avatar + Tên khi màn hình nhỏ) */}
                    <div className="md:hidden flex items-center gap-4 mb-4">
                        <img
                            src={cldOptimize(profile.avatarUrl || PLACEHOLDER_IMG, 'w_250,h_250,c_fill,g_auto')}
                            alt={profile.name}
                            className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-brand-800 shadow-sm"
                        />
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                                {profile.role === 'ADMIN' && <IoCheckmarkCircle className="text-brand-500 shrink-0" size={18} />}
                            </div>
                            <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                                Tác giả tại Lặng 24 🌿
                            </span>
                        </div>
                    </div>

                    {/* Dòng Bio (Trích dẫn/Thơ) */}
                    <div className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed italic max-w-md">
                        <p>“ Viết để ghi nhớ, đi để trưởng thành.</p>
                        <p className="mt-0.5">Yêu công nghệ, thích du lịch và những điều đẹp đẽ.</p>
                    </div>

                    {/* Các nút Mạng xã hội */}
                    {socialLinks.length > 0 && (
                        <div className="flex items-center gap-3 mt-6">
                            {socialLinks.map(({ href, icon: Icon }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-800 text-brand-700 dark:text-brand-300 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Hàng nút hành động: Liên hệ & Theo dõi */}
                    <div className="flex items-center gap-3 mt-6 w-full max-w-xs sm:max-w-none">
                        <Link
                            href="/contact"
                            className="btn-primary flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-sm"
                        >
                            <IoMailUnreadOutline className="text-base" />
                            <span>Liên hệ</span>
                        </Link>

                        <FollowButton authorId={profile.id} initialCount={profile.stats.followersCount} />
                    </div>
                </div>

                {/* CỘT PHẢI (7 cột): Card Thống kê & Giới thiệu chi tiết */}
                <div className="lg:col-span-7">
                    <div className="bg-transparent dark:bg-transparent p-6 md:p-8 border border-brand-100/70 dark:border-brand-700/60 rounded-2xl">

                        {/* 4 con số thống kê */}
                        <div className="grid grid-cols-4 gap-2 pb-6 border-b border-brand-100/70 dark:border-brand-700/60 text-center">
                            <StatMini icon={FaPencil} label="Bài viết" value={profile.stats.postCount} />
                            <StatMini icon={FaRegEye} label="Lượt xem" value={profile.stats.totalViews} />
                            <StatMini icon={FaRegHeart} label="Lượt thích" value={profile.stats.totalLikes} />
                            <StatMini icon={FaRegBookmark} label="Đang theo dõi" value={profile.stats.followersCount} />
                        </div>

                        {/* Đoạn giới thiệu bản thân */}
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mt-6 leading-relaxed">
                            {profile.bio || 'Mình là một kỹ sư phần mềm vào ban ngày, và một kẻ mộng mơ vào ban đêm. Blog này là nơi mình chia sẻ những gì mình học được, những nơi mình đã đi qua và những cảm xúc muốn lưu giữ.'}
                        </p>

                        {/* Vị trí & Ngày tham gia */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-6 text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {profile.location && (
                                <span className="flex items-center gap-1.5">
                                    <PiMapPinLineLight className="text-base" />
                                    {profile.location}
                                </span>
                            )}
                            {profile.location && <span className="text-gray-300 dark:text-gray-600">|</span>}
                            <span className="flex items-center gap-1.5">
                                <IoCalendarOutline className="text-base" />
                                Tham gia từ {joinedLabel}
                            </span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ========================================================= */}
            {/* DANH SÁCH BÀI VIẾT VÀ FOOTER TÁC GIẢ                       */}
            {/* ========================================================= */}
            <div className="mt-14">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    Bài viết của {profile.name} <PiPlantLight className="text-brand-500" />
                </h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    <Link
                        href={tabHref('')}
                        className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${!activeTag ? 'bg-brand-gradient text-white' : 'bg-white dark:bg-brand-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-brand-700 hover:border-brand-300'}`}
                    >
                        Mới nhất
                    </Link>
                    {CATEGORY_TABS.map((t) => (
                        <Link
                            key={t.tag}
                            href={tabHref(t.tag)}
                            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${activeTag === t.tag ? 'bg-brand-gradient text-white' : 'bg-white dark:bg-brand-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-brand-700 hover:border-brand-300'}`}
                        >
                            {t.label}
                        </Link>
                    ))}
                </div>

                <PostList posts={items} columns={3} />
                <Pagination currentPage={currentPage} totalPages={totalPages} basePath={tabHref(activeTag)} />
            </div>

            {/* Khối thông tin Về Lặng 24 */}
            <div className="card bg-brand-gradient-soft dark:bg-brand-800/40 p-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Về Lặng 24</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm max-w-sm">
                        "Lặng 24" là góc nhỏ mình tạo nên để chia sẻ những hành trình, những dòng chữ và cảm hứng mỗi ngày.
                        Cảm ơn bạn đã ghé qua và đồng hành cùng mình!
                    </p>
                </div>
                <Link href="/about" className="btn-primary whitespace-nowrap">
                    Tìm hiểu thêm →
                </Link>
            </div>
        </div >
    );
}