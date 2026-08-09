import PostList, { PostSummary } from '@/components/PostList';
import Pagination from '@/components/Pagination';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const PAGE_SIZE = 10;

async function getPostsByTag(slug: string, page: number) {
    try {
        const res = await fetch(`${API_URL}/posts?page=${page}&pageSize=${PAGE_SIZE}&tag=${slug}`, {
            cache: 'no-store',
        });
        if (!res.ok) return { items: [] as PostSummary[], totalPages: 1 };
        const data = await res.json();
        return { items: data.items as PostSummary[], totalPages: data.totalPages as number };
    } catch {
        return { items: [] as PostSummary[], totalPages: 1 };
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
    const { items, totalPages } = await getPostsByTag(params.slug, currentPage);

    const tagName = items[0]?.tags.find((t) => t.slug === params.slug)?.name || params.slug;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">
                Bài viết trong thẻ: <span className="text-brand">{tagName}</span>
            </h1>
            <PostList posts={items} />
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/tags/${params.slug}`} />
        </div>
    );
}