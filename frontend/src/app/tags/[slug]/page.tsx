import Link from 'next/link';
import PostList, { PostSummary } from '@/components/PostList';
import Pagination from '@/components/Pagination';
import NewsletterForm from '@/components/NewsletterForm';
import Image from 'next/image';
import type { Metadata } from 'next';


const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 9;

type TagRow = { id: string; name: string; slug: string; _count: { posts: number } };
type PopularPost = { id: string; slug: string; title: string; coverImage: string | null; views: number };

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
    const tags = await getAllTags();
    const tag = tags.find((t) => t.slug === params.slug);
    const name = tag?.name || params.slug;
    return {
        title: `${name} — Lặng 24`,
        description: `Các bài viết thuộc chuyên mục ${name.toLowerCase()} tại Lặng 24.`,
        alternates: { canonical: `${SITE_URL}/tags/${params.slug}` },
    };
}

async function getPostsByTag(slug: string, page: number) {
    try {
        const res = await fetch(`${API_URL}/posts?page=${page}&pageSize=${PAGE_SIZE}&tag=${slug}`, {
            cache: 'no-store',
        });
        if (!res.ok) return { items: [] as PostSummary[], total: 0, totalPages: 1 };
        const data = await res.json();
        return { items: data.items as PostSummary[], total: data.total as number, totalPages: data.totalPages as number };
    } catch {
        return { items: [] as PostSummary[], total: 0, totalPages: 1 };
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

async function getPopularInTag(slug: string): Promise<PopularPost[]> {
    try {
        const res = await fetch(`${API_URL}/posts/popular?limit=3&tag=${slug}`, { cache: 'no-store' });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function TagPage({
    params,
    searchParams,
}: {
    params: { slug: string };
    searchParams: { page?: string };
}) {
    const currentPage = Number(searchParams.page) || 1;
    const [{ items, total, totalPages }, allTags, popular] = await Promise.all([
        getPostsByTag(params.slug, currentPage),
        getAllTags(),
        getPopularInTag(params.slug),
    ]);

    const currentTag = allTags.find((t) => t.slug === params.slug);
    const tagName = items[0]?.tags.find((t) => t.slug === params.slug)?.name || currentTag?.name || params.slug;
    const otherTags = allTags.filter((t) => t.slug !== params.slug);

    return (
        <div className="grid lg:grid-cols-[1fr_320px] gap-10">
            <div>
                <div className="mb-8">
                    <nav className="text-sm text-gray-400 mb-3 flex items-center gap-1.5">
                        <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-300">Trang chủ</Link>
                        <span>›</span>
                        <span className="text-gray-600 dark:text-gray-300">{tagName}</span>
                    </nav>
                    <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">
                        {tagName}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 italic">
                        Ghi lại những bài viết và cảm nhận thuộc chủ đề {tagName.toLowerCase()}.
                    </p>
                    <p className="text-sm text-gray-400 mt-3">{total} bài viết</p>
                </div>

                <PostList posts={items} columns={2} />
                <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/tags/${params.slug}`} />
            </div>

            <aside className="space-y-6">
                <div className="card p-6">
                    <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-100">Chủ đề khác</h3>
                    <div className="space-y-1">
                        {otherTags.map((t) => (
                            <Link
                                key={t.id}
                                href={`/tags/${t.slug}`}
                                className="flex items-center justify-between text-sm px-3 py-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors"
                            >
                                <span className="text-gray-700 dark:text-gray-200">{t.name}</span>
                                <span className="text-xs text-gray-400">{t._count.posts} bài viết</span>
                            </Link>
                        ))}
                        {otherTags.length === 0 && <p className="text-sm text-gray-400">Chưa có chủ đề khác.</p>}
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-100">Bài viết được yêu thích</h3>
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
                        <div>
                            <h3 className="font-bold mb-1 text-gray-800 dark:text-gray-100">Đừng bỏ lỡ hành trình mới!</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                Nhận những bài viết mới nhất thuộc chủ đề {tagName.toLowerCase()} vào email của bạn.
                            </p>
                        </div>
                    </div>
                    <NewsletterForm />
                </div>
            </aside>
        </div>
    );
}