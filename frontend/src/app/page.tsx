import Link from 'next/link';
import PostList, { PostSummary } from '@/components/PostList';
import Pagination from '@/components/Pagination';
import { slugify } from '@/lib/slugify';

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const PAGE_SIZE = 10;

const TOPICS = [
  { label: 'Công nghệ', emoji: '💻' },
  { label: 'Thơ ca', emoji: '🖋️' },
  { label: 'Du ký', emoji: '🧭' },
  { label: 'Du lịch', emoji: '🏔️' },
  { label: 'Đời sống', emoji: '🍃' },
  { label: 'Cảm hứng', emoji: '✨' },
];

async function getPosts(page: number) {
  try {
    const res = await fetch(`${API_URL}/posts?page=${page}&pageSize=${PAGE_SIZE}`, { cache: 'no-store' });
    if (!res.ok) return { items: [] as PostSummary[], totalPages: 1 };
    const data = await res.json();
    return { items: data.items as PostSummary[], totalPages: data.totalPages as number };
  } catch {
    return { items: [] as PostSummary[], totalPages: 1 };
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const { items, totalPages } = await getPosts(currentPage);

  const isFirstPage = currentPage === 1;
  const featured = isFirstPage ? items[0] : undefined;
  const spotlight = isFirstPage ? items.slice(1, 4) : [];
  const rest = isFirstPage ? items.slice(4) : items;

  return (
    <div>
      {isFirstPage && (
        <>
          {/* Hero */}
          <section className="grid md:grid-cols-2 gap-8 items-center mb-14">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                Đi. Viết. <span className="heading-gradient">Cảm nhận.</span>
              </h1>
              <p className="mt-5 text-gray-500 leading-relaxed max-w-md">
                Những cung đường, những con người và những điều đẹp đẽ trên hành trình khám phá thế giới.
              </p>
              <div className="mt-7 flex gap-3">
                <Link href="#bai-viet-noi-bat" className="btn-primary">Khám phá ngay</Link>
                <Link href="/admin/posts/new" className="btn-outline">Viết bài</Link>
              </div>
            </div>
            <div className="card overflow-hidden">
              {featured?.coverImage ? (
                <img src={featured.coverImage} alt={featured.title} className="w-full h-72 object-cover" />
              ) : (
                <div className="w-full h-72 bg-brand-gradient-soft" />
              )}
            </div>
          </section>

          {/* Chủ đề */}
          <section className="mb-14">
            <h2 className="text-lg font-bold mb-5 text-gray-800">Chủ đề được yêu thích</h2>
            <div className="flex flex-wrap gap-6">
              {TOPICS.map((t) => (
                <Link
                  key={t.label}
                  href={`/tags/${slugify(t.label)}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-full bg-brand-gradient-soft flex items-center justify-center text-2xl ring-4 ring-white shadow-card group-hover:-translate-y-1 transition-transform">
                    {t.emoji}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{t.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Bài viết nổi bật */}
      {isFirstPage && featured && (
        <section id="bai-viet-noi-bat" className="mb-14">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-800">
            <span className="w-2 h-2 rounded-full bg-brand-500" /> Bài viết nổi bật
          </h2>
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
            <article className="card overflow-hidden group">
              {featured.coverImage && (
                <div className="overflow-hidden relative">
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {featured.tags[0] && (
                    <span className="absolute top-4 left-4 badge-gradient">{featured.tags[0].name}</span>
                  )}
                </div>
              )}
              <div className="p-6">
                <Link href={`/posts/${featured.slug}`}>
                  <h3 className="font-display text-xl font-bold hover:text-brand-600 transition-colors">
                    {featured.title}
                  </h3>
                </Link>
                {featured.excerpt && (
                  <p className="text-gray-500 mt-2 text-sm leading-relaxed line-clamp-2">{featured.excerpt}</p>
                )}
                <div className="mt-4 text-xs text-gray-400 flex items-center gap-3">
                  <span className="font-medium text-gray-600">{featured.author.name}</span>
                  <span>{new Date(featured.publishedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </article>

            <div className="space-y-4">
              {spotlight.map((p) => (
                <Link key={p.id} href={`/posts/${p.slug}`} className="card p-3 flex gap-3 items-center group">
                  {p.coverImage && (
                    <img src={p.coverImage} alt={p.title} className="w-16 h-16 rounded-xl2 object-cover shrink-0" />
                  )}
                  <div className="min-w-0">
                    {p.tags[0] && (
                      <span className="text-[11px] font-semibold text-brand-600">{p.tags[0].name}</span>
                    )}
                    <h4 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                      {p.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA — thuần giao diện, chưa nối API */}
      {isFirstPage && (
        <section className="mb-14 card bg-brand-gradient-soft p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Đồng hành cùng Lặng 24</h3>
            <p className="text-gray-500 mt-1.5 text-sm max-w-sm">
              Nhận bản tin mỗi tuần với những bài viết mới nhất, để không bỏ lỡ hành trình nào.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 md:w-64 border-2 border-white bg-white/80 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-brand-300"
            />
            <button type="button" className="btn-primary whitespace-nowrap">Đăng ký</button>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-800">
          <span className="w-2 h-2 rounded-full bg-brand-500" />
          {isFirstPage ? 'Bài viết mới nhất' : 'Bài viết'}
        </h2>
        <PostList posts={rest} />
      </section>

      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
    </div>
  );
}