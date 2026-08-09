import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ReactionBar from '@/components/ReactionBar';
import CommentSection from '@/components/CommentSection';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Không tìm thấy bài viết' };

  const description = post.content.replace(/<[^>]+>/g, '').slice(0, 160);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      url: `${SITE_URL}/posts/${post.slug}`,
    },
    twitter: {
      card: post.coverImage ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/posts/${post.slug}`,
    },
  };
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