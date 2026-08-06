import { notFound } from 'next/navigation';
import ReactionBar from '@/components/ReactionBar';
import CommentSection from '@/components/CommentSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImage: string | null;
  publishedAt: string;
  author: { name: string; avatarUrl: string | null };
  tags: { id: string; name: string }[];
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/posts/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <article>
      <div className="flex gap-2 mb-3">
        {post.tags.map((t) => (
          <span key={t.id} className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full">
            {t.name}
          </span>
        ))}
      </div>

      <h1 className="text-3xl font-bold">{post.title}</h1>

      <div className="mt-2 text-sm text-gray-500">
        {post.author.name} · {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
      </div>

      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full rounded-lg mt-6 mb-6" />
      )}

      <div
        className="prose max-w-none mt-6"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-8 border-t pt-6">
        <ReactionBar postId={post.id} />
      </div>

      <CommentSection postId={post.id} />
    </article>
  );
}
