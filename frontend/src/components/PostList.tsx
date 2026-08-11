import Link from 'next/link';
import { tagColor } from '@/lib/tagColors';

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
        <div className="grid sm:grid-cols-2 gap-6">
            {posts.map((post) => {
                const primaryTag = post.tags[0];
                const color = primaryTag ? tagColor(primaryTag.name) : null;
                return (
                    <article key={post.id} className="card overflow-hidden group flex flex-col">
                        {post.coverImage && (
                            <div className="overflow-hidden relative">
                                <img
                                    src={post.coverImage}
                                    alt={post.title}
                                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {color && (
                                    <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
                                        {primaryTag!.name}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                            <Link href={`/posts/${post.slug}`}>
                                <h2 className="font-display text-lg font-bold leading-snug hover:text-brand-600 transition-colors line-clamp-2">
                                    {post.title}
                                </h2>
                            </Link>
                            {post.excerpt && (
                                <p className="text-gray-500 mt-2 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                            )}
                            <div className="mt-auto pt-4 flex items-center gap-3 text-xs text-gray-400">
                                <span className="font-medium text-gray-600">{post.author.name}</span>
                                <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
                                <span className="ml-auto flex items-center gap-2">
                                    <span>💬 {post._count.comments}</span>
                                    <span>✨ {post._count.reactions}</span>
                                </span>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}