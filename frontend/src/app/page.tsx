import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string;
  author: { name: string };
  tags: { id: string; name: string }[];
  _count: { comments: number; reactions: number };
};

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${API_URL}/posts?page=1&pageSize=10`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const posts = await getPosts();

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16">
        Chưa có bài viết nào. Hãy đăng nhập với tài khoản admin để bắt đầu viết!
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
              <span key={t.id} className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full">
                {t.name}
              </span>
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
