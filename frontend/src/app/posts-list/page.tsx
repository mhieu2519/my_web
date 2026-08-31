import Link from 'next/link';
import PostListRow from '@/components/PostListRow';
import Pagination from '@/components/Pagination';
import NewsletterForm from '@/components/NewsletterForm';
import type { PostSummary } from '@/components/PostList';
import Image from 'next/image';
import type { Metadata } from 'next';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 8;

type TagRow = { id: string; name: string; slug: string; _count: { posts: number } };
type PopularPost = { id: string; slug: string; title: string; coverImage: string | null; views: number };

export const metadata: Metadata = {
    title: 'Tất cả bài viết — Lặng 24',
    description: 'Toàn bộ bài viết công nghệ, thơ ca, du ký, cảm hứng tại Lặng 24.',
};

async function getPosts(page: number, tag?: string, sort?: string) {
    try {
        const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
        if (tag) qs.set('tag', tag);
        if (sort) qs.set('sort', sort);
        const res = await fetch(`${API_URL}/posts?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) return { items: [] as PostSummary[], totalPages: 1 };
        const data = await res.json();
        return { items: data.items as PostSummary[], totalPages: data.totalPages as number };
    } catch {
        return { items: [] as PostSummary[], totalPages: 1 };
    }
}

async function getAllTags(): Promise<TagRow[]> {
    try {
        const res = await fetch(`${API_URL}/tags`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
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

export default async function PostsListPage({
    searchParams,
}: {
    searchParams: { page?: string; tag?: string; sort?: string };
}) {
    const currentPage = Number(searchParams.page) || 1;
    const activeTag = searchParams.tag;
    const sort = searchParams.sort === 'popular' ? 'popular' : 'newest';

    const [{ items, totalPages }, tags, popular] = await Promise.all([
        getPosts(currentPage, activeTag, sort),
        getAllTags(),
        getPopular(),
    ]);

    function buildHref(overrides: { tag?: string; sort?: string }) {
        const qs = new URLSearchParams();
        const nextTag = 'tag' in overrides ? overrides.tag : activeTag;
        const nextSort = 'sort' in overrides ? overrides.sort : sort;
        if (nextTag) qs.set('tag', nextTag);
        if (nextSort && nextSort !== 'newest') qs.set('sort', nextSort);
        const s = qs.toString();
        return `/posts-list${s ? `?${s}` : ''}`;
    }

    return (
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            <div>
                <div className="mb-6">
                    <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                        Tất cả bài viết 🌿
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        Những chia sẻ, cảm nhận và trải nghiệm được viết ra để lưu lại khoảnh khắc đáng nhớ.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <Link
                        href={buildHref({ tag: undefined })}
                        className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${!activeTag ? 'bg-brand-gradient text-white' : 'bg-white dark:bg-brand-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-brand-700 hover:border-brand-300'}`}
                    >
                        Tất cả
                    </Link>
                    {tags.map((t) => (
                        <Link
                            key={t.id}
                            href={buildHref({ tag: t.slug })}
                            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-colors ${activeTag === t.slug ? 'bg-brand-gradient text-white' : 'bg-white dark:bg-brand-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-brand-700 hover:border-brand-300'}`}
                        >
                            {t.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2 mb-6 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Sắp xếp:</span>
                    <Link
                        href={buildHref({ sort: 'newest' })}
                        className={`px-3 py-1 rounded-full ${sort === 'newest' ? 'bg-brand-100 dark:bg-brand-700 text-brand-700 dark:text-brand-200 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-brand-600'}`}
                    >
                        Mới nhất
                    </Link>
                    <Link
                        href={buildHref({ sort: 'popular' })}
                        className={`px-3 py-1 rounded-full ${sort === 'popular' ? 'bg-brand-100 dark:bg-brand-700 text-brand-700 dark:text-brand-200 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-brand-600'}`}
                    >
                        Xem nhiều nhất
                    </Link>
                </div>

                <PostListRow posts={items} />
                <Pagination currentPage={currentPage} totalPages={totalPages} basePath={buildHref({})} />
            </div>

            <aside className="space-y-6">
                <div className="card p-6 overflow-hidden">
                    {/* 1. Tiêu đề (Nằm ở trên cùng) */}
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-gray-100">Về Lặng 24</h3>

                    {/* 2. Ảnh (Nằm ở giữa, trải rộng full width thẻ cha) */}
                    {/* Đặt ảnh vào một container riêng để dễ quản lý kích thước */}
                    <div className="mb-6 -mx-6"> {/* Thêm margin âm -mx-6 để ảnh trải sát mép thẻ card (bù lại p-6) */}
                        <Image
                            src="/images/pic4.png"
                            alt="Mountain Illustration"
                            width={1000}
                            height={400}
                            priority
                            className="w-full h-auto object-cover select-none" // object-cover để ảnh lấp đầy khung mà không bị méo
                        />
                    </div>

                    {/* 3. Đoạn văn bản (Nằm phía dưới ảnh) */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mb-6">
                        Lặng 24 là nơi mình viết lại những điều đẹp đẽ trong cuộc sống, những chuyến đi,
                        những vần thơ và cả những dòng code.
                    </p>

                    {/* 4. Link/Nút (Nằm cuối cùng) */}
                    <Link
                        href="/about"
                        className="group inline-flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 transition-all duration-200 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 hover:shadow-sm"
                    >
                        <span>Tìm hiểu thêm</span>
                        <span
                            className="transition-transform duration-200 group-hover:translate-x-1.5"
                            aria-hidden="true"
                        >
                            →
                        </span>
                    </Link>
                </div>

                <div className="card p-6">
                    <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-100">Danh mục</h3>
                    <div className="space-y-1">
                        {tags.map((t) => (
                            <Link
                                key={t.id}
                                href={buildHref({ tag: t.slug })}
                                className="flex items-center justify-between text-sm px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors"
                            >
                                <span className="text-gray-700 dark:text-gray-200">{t.name}</span>
                                <span className="text-xs text-gray-400">{t._count.posts}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-100">Bài viết nổi bật</h3>
                    <div className="space-y-3">
                        {popular.length === 0 && <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>}
                        {popular.map((p) => (
                            <Link key={p.id} href={`/posts/${p.slug}`} className="flex gap-3 items-center group">
                                {p.coverImage && (
                                    <img src={p.coverImage} alt={p.title} className="w-14 h-14 rounded-xl2 object-cover shrink-0" />
                                )}
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors line-clamp-2">
                                    {p.title}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="card p-6">
                    {/* Phần Header: Bao gồm Ảnh bên trái & Chữ bên phải */}
                    <div className="flex items-start gap-3 mb-4">
                        {/* Khối chứa ảnh bức thư */}
                        <div className="relative w-20 h-20 shrink-0 -rotate-6 transition-transform duration-300 hover:rotate-0">
                            <Image
                                src="/images/thu2.png"
                                alt="Newsletter Envelope"
                                fill
                                className="object-contain"
                                sizes="64px"
                            />
                        </div>

                        {/* Khối Tiêu đề & Mô tả */}
                        <div>
                            <h3 className="font-bold text-base text-gray-800 dark:text-gray-100 mb-1">
                                Đăng ký nhận bản tin
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Nhận những bài viết mới nhất và ưu đãi đặc biệt từ Lặng 24.
                            </p>
                        </div>
                    </div>

                    {/* Form đăng ký bên dưới */}
                    <NewsletterForm />
                </div>
            </aside>
        </div>
    );
}