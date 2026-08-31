import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { FaFacebook, FaInstagram, FaGithub, FaGlobe } from 'react-icons/fa6';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import ReactionBar from '@/components/ReactionBar';
import CommentSection from '@/components/CommentSection';
import ShareButtons from '@/components/ShareButtons';
import PostHeaderActions from '@/components/PostHeaderActions';
import TableOfContents from '@/components/TableOfContents';
import { tagColor } from '@/lib/tagColors';
import { slugify } from '@/lib/slugify';
import { formatCount } from '@/lib/format';
import { cldOptimize } from '@/lib/cloudinary';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  coverCaption: string | null;
  hashtags: string[];
  publishedAt: string;
  views: number;
  author: {
    id: string; name: string; avatarUrl: string | null; bio: string | null;
    websiteUrl: string | null; facebookUrl: string | null; instagramUrl: string | null; githubUrl: string | null;
    role: 'ADMIN' | 'USER';
  };
  commentsEnabled?: boolean;
  tags: { id: string; name: string; slug?: string }[];
  reactions: { type: string; userId: string }[];
  prevPost: { slug: string; title: string } | null;
  nextPost: { slug: string; title: string } | null;
};

type RelatedPost = {
  id: string;
  slug: string;
  title: string;
  coverImage: string | null;
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

async function getRelated(tagSlug: string | undefined, excludeSlug: string): Promise<RelatedPost[]> {
  if (!tagSlug) return [];
  try {
    const res = await fetch(`${API_URL}/posts?page=1&pageSize=4&tag=${tagSlug}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items as RelatedPost[]).filter((p) => p.slug !== excludeSlug).slice(0, 3);
  } catch {
    return [];
  }
}

function extractHeadings(html: string) {
  const headings: { id: string; text: string }[] = [];
  let counter = 0;
  const withIds = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_match, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text) return `<h2${attrs}>${inner}</h2>`;
    counter += 1;
    const id = `section-${counter}`;
    headings.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: withIds, headings };
}

function estimateReadTime(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
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

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const primaryTag = post.tags[0];
  const primaryTagSlug = primaryTag?.slug || (primaryTag ? slugify(primaryTag.name) : undefined);
  const related = await getRelated(primaryTagSlug, post.slug);

  const { html: contentWithIds, headings } = extractHeadings(post.content);
  const readTime = estimateReadTime(post.content);
  const timeAgo = formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: vi });
  const shareUrl = `${SITE_URL}/posts/${post.slug}`;

  const socialLinks = [
    post.author.websiteUrl && { href: post.author.websiteUrl, icon: FaGlobe, label: 'Website' },
    post.author.facebookUrl && { href: post.author.facebookUrl, icon: FaFacebook, label: 'Facebook' },
    post.author.instagramUrl && { href: post.author.instagramUrl, icon: FaInstagram, label: 'Instagram' },
    post.author.githubUrl && { href: post.author.githubUrl, icon: FaGithub, label: 'Github' },
  ].filter(Boolean) as { href: string; icon: any; label: string }[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { '@type': 'Person', name: post.author.name },
    mainEntityOfPage: `${SITE_URL}/posts/${post.slug}`,
  };

  return (
    //<div className="-mx-4 md:-mx-[calc((64rem-48rem)/2)] overflow-x-hidden">
    //<div className=" overflow-x-hidden">
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-5xl mx-auto px-4">
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-300">Trang chủ</Link>
          {primaryTag && (
            <>
              <span>›</span>
              <Link href={`/tags/${primaryTagSlug}`} className="hover:text-brand-600 dark:hover:text-brand-300">{primaryTag.name}</Link>
            </>
          )}
          <span>›</span>
          <span className="text-gray-600 dark:text-gray-300 truncate max-w-[60vw]">{post.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-10">
          <article className="min-w-0">
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((t) => {
                  const c = tagColor(t.name);
                  return (
                    <span key={t.id} className={`text-xs font-semibold px-3 py-1 rounded-full ${c.bg} ${c.text}`}>
                      {t.name}
                    </span>
                  );
                })}
              </div>
              <PostHeaderActions
                postId={post.id}
                reactionsTotal={post.reactions.length}
                shareUrl={shareUrl}
                shareTitle={post.title}
              />
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-3 text-gray-500 dark:text-gray-400 leading-relaxed">{post.excerpt}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-gray-400">
              <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-200">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="w-6 h-6 rounded-full bg-brand-gradient inline-block" />
                )}
                {post.author.name}
              </span>
              <span>•</span>
              <span>{timeAgo}</span>
              <span>•</span>
              <span>{readTime} phút đọc</span>
              <span>•</span>
              <span>{formatCount(post.views)} lượt xem</span>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-6">
              <div className="sm:sticky sm:top-24 sm:h-fit">
                <ShareButtons url={shareUrl} title={post.title} />
              </div>

              <div className="flex-1 min-w-0">
                {post.coverImage && (
                  <figure className="mb-8">
                    <img src={cldOptimize(post.coverImage, 'w_1000')} alt={post.title} className="w-full rounded-xl2" />
                    {post.coverCaption && (
                      <figcaption className="text-center text-sm text-gray-400 dark:text-gray-500 italic mt-2.5">
                        {post.coverCaption}
                      </figcaption>
                    )}
                  </figure>
                )}

                <div
                  className="prose dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-brand-600"
                  dangerouslySetInnerHTML={{ __html: contentWithIds }}
                />

                {post.hashtags?.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-brand-100 dark:border-brand-800">
                    {post.hashtags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/search?q=${encodeURIComponent(tag)}`}
                        className="text-sm text-brand-600 dark:text-brand-300 hover:underline"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 border-t border-brand-100 dark:border-brand-800 pt-8">
              <ReactionBar postId={post.id} />
            </div>

            {(post.prevPost || post.nextPost) && (
              <div className="mt-8 grid grid-cols-2 gap-4">
                {post.prevPost ? (
                  <Link
                    href={`/posts/${post.prevPost.slug}`}
                    className="card p-4 flex items-center gap-2 hover:border-brand-300 border-2 border-transparent transition-colors"
                  >
                    <HiChevronLeft className="text-gray-400 shrink-0" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Bài trước</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{post.prevPost.title}</p>
                    </div>
                  </Link>
                ) : <div />}
                {post.nextPost ? (
                  <Link
                    href={`/posts/${post.nextPost.slug}`}
                    className="card p-4 flex items-center justify-end gap-2 text-right hover:border-brand-300 border-2 border-transparent transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">Bài tiếp theo</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{post.nextPost.title}</p>
                    </div>
                    <HiChevronRight className="text-gray-400 shrink-0" size={20} />
                  </Link>
                ) : <div />}
              </div>
            )}

            {post.commentsEnabled === false ? (
              <p className="mt-10 text-sm text-gray-400 border-t border-brand-100 dark:border-brand-800 pt-8">
                Bình luận đã được tắt cho bài viết này.
              </p>
            ) : (
              <CommentSection postId={post.id} />
            )}
          </article>

          <aside className="space-y-6">
            <div className="card p-5 lg:sticky lg:top-24 bg-transparent">
              <h3 className="font-bold text-sm mb-3 text-gray-800 dark:text-gray-100">Tác giả</h3>
              <div className="flex items-center gap-3">
                {post.author.avatarUrl ? (
                  <img src={cldOptimize(post.author.avatarUrl, 'w_96,h_96,c_fill,g_auto')} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <span className="w-12 h-12 rounded-full bg-brand-gradient inline-block" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-100">
                    {post.author.name}
                    {post.author.role === 'ADMIN' && <IoCheckmarkCircle className="text-brand-500 shrink-0" size={15} />}
                  </div>
                  <p className="text-xs text-gray-400">Tác giả tại Lặng 24 🌿</p>
                </div>
              </div>

              {post.author.bio && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed line-clamp-3">
                  {post.author.bio}
                </p>
              )}

              {socialLinks.length > 0 && (
                <div className="flex gap-2 mt-4">
                  {socialLinks.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-800 text-brand-700 dark:text-brand-300 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors"
                    >
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
              )}

              <Link
                href={`/authors/${post.author.id}`}
                className="btn-outline w-full text-center text-sm mt-4 block"
              >
                Xem tất cả bài viết
              </Link>
            </div>

            {headings.length > 0 && <TableOfContents headings={headings} />}

            {related.length > 0 && (
              <div className="card p-5 bg-transparent">
                <h3 className="font-bold text-sm mb-3 text-gray-800 dark:text-gray-100">Bài viết liên quan</h3>
                <div className="space-y-3">
                  {related.map((r) => (
                    <Link key={r.id} href={`/posts/${r.slug}`} className="flex gap-3 items-center group">
                      {r.coverImage && (
                        <img src={r.coverImage} alt={r.title} className="w-14 h-14 rounded-xl2 object-cover shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors line-clamp-2">
                        {r.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="card bg-brand-gradient-soft dark:bg-brand-800/40 p-5 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Bạn có câu chuyện muốn chia sẻ?</p>
              <Link href="/contact" className="btn-primary text-sm inline-block">
                Liên hệ với mình
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}