import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaFacebook, FaInstagram, FaGithub, FaGlobe } from 'react-icons/fa6';
import { IoCheckmarkCircle } from 'react-icons/io5';
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
    { label: 'Du lịch', tag: slugify('Du lịch') },
    { label: 'Đời sống', tag: slugify('Đời sống') },
    { label: 'Cảm hứng', tag: slugify('Cảm hứng') },
];

type PublicProfile = {
    id: string;
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

function StatBox({ icon, label, value }: { icon: string; label: string; value: number }) {
    return (
        <div className="card p-4 text-center">
            <div className="text-lg mb-1">{icon}</div>
            <div className="font-display text-xl font-bold text-gray-900 dark:text-white">{formatCount(value)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{label}</div>
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
        <div>
            {/* Card thông tin chính */}
            <div className="card overflow-hidden">
                <div className="relative h-40 md:h-56">
                    <img src={PLACEHOLDER_IMG} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="px-6 md:px-8 pb-8">
                    <div className="-mt-12 md:-mt-14 flex flex-col md:flex-row md:items-end justify-between gap-5">
                        <div className="flex items-end gap-4">
                            <img
                                src={cldOptimize(profile.avatarUrl || PLACEHOLDER_IMG, 'w_96,h_96,c_fill,g_auto')}
                                alt={profile.name}
                                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-white dark:ring-brand-800 shadow-card shrink-0"
                            />
                            <div className="pb-1">
                                <div className="flex items-center gap-1.5">
                                    <h1 className="font-display text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                        {profile.name}
                                    </h1>
                                    {profile.role === 'ADMIN' && <IoCheckmarkCircle className="text-brand-500 shrink-0" size={17} />}
                                </div>
                                <p className="text-sm text-gray-400">Tác giả tại Lặng 24 🌿</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Link href="/contact" className="btn-outline text-sm">✉️ Liên hệ</Link>
                            <FollowButton authorId={profile.id} initialCount={profile.stats.followersCount} />
                        </div>
                    </div>

                    {profile.bio && (
                        <p className="italic text-gray-500 dark:text-gray-400 mt-5 border-l-4 border-brand-200 dark:border-brand-700 pl-4 leading-relaxed">
                            "{profile.bio}"
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                        {profile.location && <span className="flex items-center gap-1.5">📍 {profile.location}</span>}
                        <span className="flex items-center gap-1.5">📅 Tham gia từ {joinedLabel}</span>
                    </div>

                    {socialLinks.length > 0 && (
                        <div className="flex gap-2 mt-4">
                            {socialLinks.map(({ href, icon: Icon }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-800 text-brand-700 dark:text-brand-300 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors"
                                >
                                    <Icon size={15} />
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Thống kê */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <StatBox icon="✏️" label="Bài viết" value={profile.stats.postCount} />
                <StatBox icon="👁" label="Lượt xem" value={profile.stats.totalViews} />
                <StatBox icon="❤️" label="Lượt thích" value={profile.stats.totalLikes} />
                <StatBox icon="🔖" label="Đang theo dõi" value={profile.stats.followersCount} />
            </div>

            {/* Bài viết của tác giả */}
            <div className="mt-10">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Bài viết của {profile.name} 🌿
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

            {/* Về Lặng 24 */}
            <div className="card bg-brand-gradient-soft dark:bg-brand-800/40 p-8 mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">Về Lặng 24</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm max-w-sm">
                        "Lặng 24" là góc nhỏ mình tạo nên để chia sẻ những hành trình, những dòng chữ và cảm hứng mỗi ngày.
                        Cảm ơn bạn đã ghé qua và đồng hành cùng mình!
                    </p>
                </div>
                <Link href="/about" className="btn-primary whitespace-nowrap">Tìm hiểu thêm →</Link>
            </div>
        </div >
    );
}