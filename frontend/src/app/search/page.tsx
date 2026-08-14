import Link from 'next/link';
import PostListRow from '@/components/PostListRow';
import Pagination from '@/components/Pagination';
import SearchBox from '@/components/SearchBox';
import SortSelect from '@/components/SortSelect';
import NewsletterForm from '@/components/NewsletterForm';
import type { PostSummary } from '@/components/PostList';
import Image from 'next/image';
import {
    HiOutlineFolder,
    HiOutlineMapPin,
    HiOutlineGlobeAsiaAustralia,
    HiOutlineCpuChip,
    HiOutlineHeart,
    HiOutlineBookOpen,
    HiOutlineSparkles
} from 'react-icons/hi2';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const PAGE_SIZE = 6;

const TIME_RANGES = [
    { value: '', label: 'Tất cả thời gian' },
    { value: '7', label: '7 ngày qua' },
    { value: '30', label: '30 ngày qua' },
    { value: '90', label: '3 tháng qua' },
    { value: '365', label: '1 năm qua' },
];

// Hàm lấy icon tương ứng với slug của chuyên mục (Đồng bộ chuẩn màu brand)
function getCategoryIcon(slug: string) {
    const iconClass = "w-4 h-4 text-brand-700 dark:text-brand-300";
    switch (slug) {
        case 'du-ky': return <HiOutlineMapPin className={iconClass} />;
        case 'du-lich': return <HiOutlineGlobeAsiaAustralia className={iconClass} />;
        case 'cong-nghe': return <HiOutlineCpuChip className={iconClass} />;
        case 'doi-song': return <HiOutlineHeart className={iconClass} />;
        case 'tho-ca': return <HiOutlineBookOpen className={iconClass} />;
        case 'cam-hung': return <HiOutlineSparkles className={iconClass} />;
        default: return <HiOutlineFolder className={iconClass} />;
    }
}

type Facets = { total: number; tags: { id: string; name: string; slug: string; count: number }[] };
type PopularPost = { id: string; slug: string; title: string; views: number; createdAt?: string; coverImage?: string };
type TagRow = { id: string; name: string; slug: string; _count: { posts: number } };

async function getResults(q: string, tag: string, range: string, sort: string, page: number) {
    try {
        const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (q) qs.set('search', q);
        if (tag) qs.set('tag', tag);
        if (range) qs.set('range', range);
        if (sort) qs.set('sort', sort);
        const res = await fetch(`${API_URL}/posts?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) return { items: [] as PostSummary[], total: 0, totalPages: 1 };
        const data = await res.json();
        return { items: data.items as PostSummary[], total: data.total as number, totalPages: data.totalPages as number };
    } catch {
        return { items: [] as PostSummary[], total: 0, totalPages: 1 };
    }
}

async function getFacets(q: string, range: string): Promise<Facets> {
    try {
        const qs = new URLSearchParams();
        if (q) qs.set('search', q);
        if (range) qs.set('range', range);
        const res = await fetch(`${API_URL}/posts/search-facets?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) return { total: 0, tags: [] };
        return res.json();
    } catch {
        return { total: 0, tags: [] };
    }
}

async function getPopular(): Promise<PopularPost[]> {
    try {
        const res = await fetch(`${API_URL}/posts/popular?limit=3`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

async function getPopularTags(): Promise<TagRow[]> {
    try {
        const res = await fetch(`${API_URL}/tags`, { cache: 'no-store' });
        if (!res.ok) return [];
        const tags: TagRow[] = await res.json();
        return [...tags].sort((a, b) => b._count.posts - a._count.posts).slice(0, 10);
    } catch {
        return [];
    }
}

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string; tag?: string; range?: string; sort?: string; page?: string };
}) {
    const q = searchParams.q?.trim() || '';
    const tag = searchParams.tag || '';
    const range = searchParams.range || '';
    const sort = searchParams.sort === 'popular' ? 'popular' : 'newest';
    const currentPage = Number(searchParams.page) || 1;

    const [{ items, total, totalPages }, facets, popular, popularTags] = await Promise.all([
        getResults(q, tag, range, sort, currentPage),
        getFacets(q, range),
        getPopular(),
        getPopularTags(),
    ]);

    function hrefFor(overrides: { tag?: string; range?: string; sort?: string }) {
        const qs = new URLSearchParams();
        if (q) qs.set('q', q);
        const nextTag = 'tag' in overrides ? overrides.tag : tag;
        const nextRange = 'range' in overrides ? overrides.range : range;
        const nextSort = 'sort' in overrides ? overrides.sort : sort;
        if (nextTag) qs.set('tag', nextTag);
        if (nextRange) qs.set('range', nextRange);
        if (nextSort && nextSort !== 'newest') qs.set('sort', nextSort);
        const s = qs.toString();
        return `/search${s ? `?${s}` : ''}`;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">

            {/* 1. Header Tìm kiếm */}
            <div className="relative mb-8 pt-4 pb-2">
                <div className="relative z-10 flex flex-col md:grid md:grid-cols-3 md:items-center gap-4">

                    <div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            Kết quả tìm kiếm
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                            {q ? (
                                <>Tìm thấy <span className="font-semibold text-brand-800 dark:text-brand-300">{total}</span> kết quả cho &ldquo;<span className="font-semibold text-brand-800 dark:text-brand-300">{q}</span>&rdquo;</>
                            ) : (
                                'Nhập từ khóa để bắt đầu tìm kiếm'
                            )}
                        </p>
                    </div>

                    <div className="w-full max-w-[420px] mx-auto">
                        <SearchBox initialQuery={q} />
                    </div>

                    <div className="hidden md:block"></div>
                </div>

                <div className="absolute right-0 bottom-0 top-0 w-full md:w-full max-w-3xl pointer-events-none z-0 opacity-90 md:opacity-100">
                    <Image
                        src="/images/pic3.png"
                        alt="Mountain Illustration"
                        fill
                        priority
                        className="object-contain object-right-bottom select-none scale-150 origin-bottom-right"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-[260px_1fr_320px] gap-8">
                {/* 2. Cột Bộ lọc bên trái */}
                <aside className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-gray-100">Bộ lọc</h3>

                        {/* Chuyên mục */}
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                            <span>Chuyên mục</span>
                        </div>
                        <div className="space-y-1 mb-6">
                            <Link
                                href={hrefFor({ tag: '' })}
                                className={`flex items-center justify-between text-sm px-2 py-2 rounded-lg transition-colors ${!tag ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-800 dark:text-brand-200 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                <span className="flex items-center gap-2">
                                    <HiOutlineFolder className="w-4 h-4 text-brand-700 dark:text-brand-300" />
                                    Tất cả chuyên mục
                                </span>
                                <span className="text-xs text-gray-400 font-normal">({facets.total})</span>
                            </Link>
                            {facets.tags.filter((t) => t.count > 0).map((t) => (
                                <Link
                                    key={t.id}
                                    href={hrefFor({ tag: t.slug })}
                                    className={`flex items-center justify-between text-sm px-2 py-2 rounded-lg transition-colors ${tag === t.slug ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-800 dark:text-brand-200 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <span className="flex items-center gap-2">
                                        {getCategoryIcon(t.slug)}
                                        {t.name}
                                    </span>
                                    <span className="text-xs text-gray-400 font-normal">({t.count})</span>
                                </Link>
                            ))}
                        </div>

                        {/* Thời gian */}
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Thời gian</p>
                        <div className="space-y-1 mb-6">
                            {TIME_RANGES.map((r) => (
                                <Link
                                    key={r.value}
                                    href={hrefFor({ range: r.value })}
                                    className={`flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-lg transition-colors ${range === r.value ? 'text-brand-800 dark:text-brand-200 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-brand-700'}`}
                                >
                                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${range === r.value ? 'border-brand-700' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {range === r.value && <span className="w-2 h-2 rounded-full bg-brand-700" />}
                                    </span>
                                    {r.label}
                                </Link>
                            ))}
                        </div>

                        {/* Sắp xếp theo */}
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mb-5">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Sắp xếp theo</p>
                            <SortSelect value={sort} />
                        </div>

                        <button
                            type="button"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <span>Áp dụng bộ lọc</span>
                        </button>
                    </div>
                </aside>

                {/* 3. Cột Giữa (Danh sách kết quả) */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{total} kết quả tìm thấy</p>
                    </div>

                    <PostListRow posts={items} />

                    <div className="mt-8">
                        <Pagination currentPage={currentPage} totalPages={totalPages} basePath={hrefFor({})} />
                    </div>
                </div>

                {/* 4. Cột bên phải (Sidebar phải) */}
                <aside className="space-y-6">
                    {/* Tìm kiếm phổ biến */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-base mb-3 text-gray-900 dark:text-gray-100">Tìm kiếm phổ biến</h3>
                        <div className="flex flex-wrap gap-2">
                            {popularTags.map((t) => (
                                <Link
                                    key={t.id}
                                    href={`/search?q=${encodeURIComponent(t.name)}`}
                                    className="text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-800 dark:hover:bg-brand-900/40 transition-colors"
                                >
                                    {t.name}
                                </Link>
                            ))}
                            {popularTags.length === 0 && <span className="text-sm text-gray-400">Chưa có dữ liệu.</span>}
                        </div>
                    </div>

                    {/* Bài viết nổi bật */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-gray-100">Bài viết nổi bật</h3>
                        <div className="space-y-4">
                            {popular.length === 0 && <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>}
                            {popular.map((p) => (
                                <Link key={p.id} href={`/posts/${p.slug}`} className="flex gap-3 items-center group">
                                    <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                        <Image
                                            src={p.coverImage || '/images/default-thumbnail.png'}
                                            alt={p.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
                                            {p.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '20/04/2024'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="card p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="relative w-20 h-20 shrink-0 -rotate-6 transition-transform duration-300 hover:rotate-0">
                                <Image
                                    src="/images/thu2.png"
                                    alt="Newsletter Envelope"
                                    fill
                                    className="object-contain"
                                    sizes="64px"
                                />
                            </div>

                            <div>
                                <h3 className="font-bold mb-1 text-gray-800 dark:text-gray-100">Nhận bài viết mới nhất</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                    Nhận những hành trình mới, cảm xúc mới mỗi tuần.
                                </p>
                            </div>
                        </div>
                        <NewsletterForm />
                    </div>
                </aside>
            </div>
        </div>
    );
}