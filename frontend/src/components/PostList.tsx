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
            <div className="text-center text-gray-400 py-24">
                <p className="text-lg">Chưa có bài viết nào.</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {posts.map((post) => (
                <article key={post.id} className="card overflow-hidden group">
                    {post.coverImage && (
                        <div className="overflow-hidden">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    )}
                    <div className="p-6">
                        <div className="flex gap-2 mb-3 flex-wrap">
                            {post.tags.map((t) => (
                                <Link key={t.id} href={`/tags/${t.slug}`} className="badge-gradient hover:opacity-90">
                                    {t.name}
                                </Link>
                            ))}
                        </div>
                        <Link href={`/posts/${post.slug}`}>
                            <h2 className="text-2xl font-bold hover:heading-gradient transition-colors">
                                {post.title}
                            </h2>
                        </Link>
                        {post.excerpt && <p className="text-gray-600 mt-3 leading-relaxed">{post.excerpt}</p>}
                        <div className="mt-5 pt-4 border-t border-gray-100 text-sm text-gray-400 flex items-center gap-4">
                            <span className="font-medium text-gray-600">{post.author.name}</span>
                            <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                            <span>💬 {post._count.comments}</span>
                            <span>✨ {post._count.reactions}</span>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}