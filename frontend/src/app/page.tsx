import Link from 'next/link';
import Image from 'next/image';
import PostList, { PostSummary } from '@/components/PostList';
import Pagination from '@/components/Pagination';
import CategoryCard from '@/components/CategoryCard';
import NewsletterForm from '@/components/NewsletterForm';
import { slugify } from '@/lib/slugify';
import { formatCount } from '@/lib/format';
import { TbLeaf } from "react-icons/tb";
import { BsBackpack2 } from "react-icons/bs";
import { LiaCameraRetroSolid } from "react-icons/lia";
import { IoCafeOutline } from "react-icons/io5";
import { TiLightbulb } from "react-icons/ti";
import { HiOutlineDesktopComputer } from "react-icons/hi";
import { PiLeafDuotone } from "react-icons/pi";
import { FaRegHeart } from "react-icons/fa";
import { GoPencil } from "react-icons/go";
import { TbPoint } from "react-icons/tb";


const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const PAGE_SIZE = 8;
const PLACEHOLDER_IMG = '/images/slide3.png';

const TOPICS = [
  {
    label: 'Công nghệ',
    icon: HiOutlineDesktopComputer,
    desc: 'Chia sẻ kiến thức, thủ thuật và xu hướng mới nhất'
  },
  {
    label: 'Thơ ca',
    icon: TbLeaf,
    desc: 'Những vần thơ lặng lẽ, chạm đến cảm xúc'
  },
  {
    label: 'Du ký',
    icon: BsBackpack2,
    desc: 'Những hành trình đi để trưởng thành'
  },
  {
    label: 'Du lịch',
    icon: LiaCameraRetroSolid,
    desc: 'Địa điểm đẹp, trải nghiệm và cẩm nang hữu ích'
  },
  {
    label: 'Đời sống',
    icon: IoCafeOutline,
    desc: 'Câu chuyện đời thường, điều nhỏ bé và ý nghĩa'
  },
  {
    label: 'Cảm hứng',
    icon: TiLightbulb,
    desc: 'Nguồn năng lượng tích cực cho mỗi ngày'
  },
];

type PopularPost = { id: string; slug: string; title: string; publishedAt: string; views: number };
type TagRow = { id: string; name: string; slug: string; _count: { posts: number } };

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

async function getPopular(): Promise<PopularPost[]> {
  try {
    const res = await fetch(`${API_URL}/posts/popular?limit=4`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getTrendingTags(): Promise<TagRow[]> {
  try {
    const res = await fetch(`${API_URL}/tags`, { cache: 'no-store' });
    if (!res.ok) return [];
    const tags: TagRow[] = await res.json();
    return [...tags].sort((a, b) => b._count.posts - a._count.posts).slice(0, 8);
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const isFirstPage = currentPage === 1;

  const [{ items, totalPages }, popular, trendingTags] = await Promise.all([
    getPosts(currentPage),
    isFirstPage ? getPopular() : Promise.resolve([]),
    isFirstPage ? getTrendingTags() : Promise.resolve([]),
  ]);

  const featured = isFirstPage ? items[0] : undefined;

  return (
    <div>
      {isFirstPage && (
        <>
          {/* 1. Hero Section: Đặt Ảnh bên trái (order-2 md:order-1), Text bên phải (order-1 md:order-2) */}
          <section className="grid md:grid-cols-12 gap-8 items-center mb-12">
            <div className="md:col-span-7 relative h-[360px] md:h-[420px] rounded-2xl overflow-hidden shadow-sm">
              <Image
                src={featured?.coverImage || PLACEHOLDER_IMG}
                alt={featured?.title || 'Lặng 24'}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            </div>

            <div className="md:col-span-5 flex flex-col justify-center pl-0 md:pl-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                Chào mừng bạn đến với
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                Lặng <span className="font-script heading-gradient">24</span> 🌿
              </h1>
              <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                Một góc nhỏ để chúng ta cùng chậm lại, viết ra những điều tử tế, chia sẻ những
                hành trình đáng nhớ và lan tỏa cảm hứng mỗi ngày.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Link href="#bai-viet-noi-bat" className="btn-primary text-sm px-5 py-2.5">
                  Đọc bài mới nhất
                </Link>
                <Link href="/posts-list" className="btn-outline text-sm px-5 py-2.5">
                  Khám phá ngay
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                <span className="flex items-center gap-1.5"><GoPencil /> Bài viết chất lượng</span>
                <span className="flex items-center gap-1.5"><PiLeafDuotone /> Nội dung đa dạng</span>
                <span className="flex items-center gap-1.5"><FaRegHeart /> Truyền cảm hứng</span>
              </div>
            </div>
          </section>

          {/* 2. Danh mục 6 chủ đề hiển thị 6 cột trên màn hình rộng */}
          <section className="mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {TOPICS.map((t) => (
                <CategoryCard
                  key={t.label}
                  icon={t.icon}
                  title={t.label}
                  description={t.desc}
                  href={`/tags/${slugify(t.label)}`}
                  imageSrc={PLACEHOLDER_IMG}
                />
              ))}
            </div>
          </section>

          {/* 3. Quote Banner giữa trang với ảnh nền mới */}
          <section className="mb-12 rounded-2xl overflow-hidden relative shadow-sm h-[140px] md:h-[160px]"> {/* Cần chiều cao cố định */}
            {/* Ảnh nền */}
            <Image
              src="/images/anh1.png" // Đường dẫn đến ảnh của bạn trong thư mục public
              alt="Quote background"
              fill
              sizes="100vw"
              className="object-cover" // Giúp ảnh cover toàn bộ diện tích
              priority // Đặt là priority nếu phần này nằm trong màn hình đầu tiên
            />

            {/* Lớp overlay (Tùy chọn: giúp chữ dễ đọc hơn) */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/40 z-10"></div>

            {/* Nội dung chữ (Cần absolute và z-index cao hơn ảnh/overlay) */}
            <div className="relative z-20 h-full max-w-xl mx-auto flex flex-col items-center justify-center text-center p-6">
              <p className="text-lg md:text-2xl font-display italic text-gray-900 dark:text-white leading-relaxed drop-shadow-md">
                "Những điều đẹp đẽ nhất thường bắt đầu từ những điều rất nhỏ bé."
              </p>
              <p className="mt-3 text-xs md:text-sm text-gray-700 dark:text-gray-200 font-medium">— Lặng 24 —</p>
            </div>
          </section>

        </>
      )}

      {/* Bài viết mới nhất */}
      <section id="bai-viet-noi-bat" className="mb-12">
        <div className="flex items-center justify-between mb-6 pr-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            {isFirstPage ? 'Bài viết mới nhất 🌿' : 'Bài viết'}
          </h2>
          {isFirstPage && (
            <Link
              href="/posts-list"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800 transition-transform duration-200 hover:scale-105 origin-left"
            >
              <span>Xem tất cả bài viết</span>
              <span
                className="transition-transform group-hover:translate-x-1.5 duration-200"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          )}
        </div>
        <PostList posts={items} columns={4} />
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
      </section>

      {/* Bottom Sections */}
      {isFirstPage && (
        <section className="grid md:grid-cols-12 gap-6">
          {/* Bài viết yêu thích */}
          <div className="md:col-span-4 card p-5 bg-[#fbf9f5]">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100 text-sm">Bài viết được yêu thích</h3>
            <ol className="space-y-3">
              {popular.length === 0 && <li className="text-xs text-gray-400">Chưa có dữ liệu.</li>}
              {popular.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/posts/${p.slug}`} className="flex items-center gap-3 group">
                    <span className="text-sm font-bold text-gray-400 group-hover:text-brand-600">{i + 1}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-brand-600 line-clamp-1">
                        {p.title}
                      </span>

                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        <span>{new Date(p.publishedAt).toLocaleDateString('vi-VN')}</span>
                        <TbPoint className="text-[8px]" />
                        <span>{formatCount(p.views)} lượt xem</span>
                      </div>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          {/* Thẻ & Cảm hứng */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="card p-5 bg-[#fbf9f5] flex-1">
              <h3 className="font-bold mb-3 text-gray-900 dark:text-gray-100 text-sm">Chủ đề thịnh hành</h3>
              <div className="flex flex-wrap gap-1.5">
                {trendingTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="text-[11px] font-medium bg-gray-100 dark:bg-brand-800 text-gray-600 dark:text-brand-300 px-2.5 py-1 rounded-md hover:bg-gray-200"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="card p-5 bg-[#fbf9f5] dark:bg-brand-800/60 relative overflow-hidden flex items-center justify-between min-h-[100px]">
              {/* Khối chữ: Tự động co giãn max-width theo mobile/desktop */}
              <div className="relative z-10 max-w-[65%] sm:max-w-[70%]">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">
                  Cảm hứng mỗi ngày
                </h3>
                <p className="text-xs text-gray-500">
                  Hôm nay là một ngày tuyệt vời để bắt đầu viết nên câu chuyện của riêng bạn.
                </p>
              </div>

              {/* Khối chứa ảnh: Co giãn linh hoạt theo tỷ lệ thẻ parent */}
              <div className="absolute right-0 bottom-0 top-0 w-[30%] max-w-[110px] z-0 pointer-events-none flex items-end justify-end">
                <div className="relative w-full h-[90%]">
                  <Image
                    src="/images/cay1.png"
                    alt="Cây cảnh trang trí"
                    fill
                    className="object-contain object-right-bottom"
                    sizes="(max-width: 768px) 80px, 110px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4 card p-5 bg-[#f4f1ea] dark:bg-brand-800/50 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Khối nội dung chữ & form: Giới hạn max-width trên cả mobile và desktop để nhường chỗ cho ảnh */}
            <div className="relative z-10 max-w-[65%] sm:max-w-[70%] flex flex-col justify-between h-full">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">
                  Nhận bài viết mới nhất từ Lặng 24
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Đăng ký để không bỏ lỡ những bài viết hay và nhiều điều thú vị khác!
                </p>
              </div>

              <NewsletterForm />
            </div>

            {/* Khối chứa ảnh lá thư: Đưa vị trí lên cao hơn (-top-2 hoặc top-1/2) và căn sang phải */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[35%] max-w-[140px] h-[85%] z-0 pointer-events-none flex items-center justify-end">
              <div className="relative w-full h-full rotate-3">
                <Image
                  src="/images/thu.png"
                  alt="Newsletter Envelope"
                  fill
                  className="object-contain object-right"
                  sizes="(max-width: 768px) 120px, 150px"
                />
              </div>
            </div>
          </div>

        </section>
      )}
    </div>
  );
}