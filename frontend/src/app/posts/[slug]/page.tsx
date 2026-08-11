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
    <article className="card p-8 md:p-12">
      <div className="flex gap-2 mb-4 flex-wrap">
        {post.tags.map((t) => (
          <span key={t.id} className="badge-gradient">
            {t.name}
          </span>
        ))}
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{post.title}</h1>

      <div className="mt-3 text-sm text-gray-400 flex items-center gap-2">
        <span className="font-medium text-gray-600">{post.author.name}</span>
        <span>·</span>
        <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
      </div>

      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full rounded-xl2 mt-8 mb-8" />
      )}

      <div
        className="prose max-w-none mt-6 prose-headings:font-bold prose-a:text-brand-600"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-10 border-t border-gray-100 pt-8">
        <ReactionBar postId={post.id} />
      </div>

      <CommentSection postId={post.id} />
    </article>
  );
}