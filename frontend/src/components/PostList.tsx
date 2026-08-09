import Link from 'next/link';

export type PostSummary = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: string;
    author: { name: string };
    tags: { id: string; name: string; slug: string }[];
    _count: { comments: number; reactions: number };
};

export default function PostList({ posts }: { posts: PostSummary[] }) {
    if (posts.length === 0) {
        return (
            <div className="text-center text-gray-500 py-16">
                Chưa có bài viết nào.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
                    {post.coverImage && (
                        <img src={post.coverImage} alt={post.title} className="w-full h-56 object-cover rounded-md mb-4" />
                    )}
                    <div className="flex gap-2 mb-2">
                        {post.tags.map((t) => (
                            <Link
                                key={t.id}
                                href={`/tags/${t.slug}`}
                                className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full hover:bg-brand/20"
                            >
                                {t.name}
                            </Link>
                        ))}
                    </div>
                    <Link href={`/posts/${post.slug}`}>
                        <h2 className="text-xl font-semibold hover:text-brand">{post.title}</h2>
                    </Link>
                    {post.excerpt && <p className="text-gray-600 mt-2">{post.excerpt}</p>}
                    <div className="mt-4 text-sm text-gray-400 flex items-center gap-4">
                        <span>{post.author.name}</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                        <span>{post._count.comments} bình luận</span>
                        <span>{post._count.reactions} cảm xúc</span>
                    </div>
                </article>
            ))}
        </div>
    );
}