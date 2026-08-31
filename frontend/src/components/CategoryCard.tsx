import Link from 'next/link';
import Image from 'next/image';
import { IconType } from 'react-icons';

export default function CategoryCard({
    icon: Icon,
    title,
    description,
    href,
    imageSrc,
}: {
    icon: IconType;
    title: string;
    description: string;
    href: string;
    imageSrc: string;
}) {
    return (
        <Link
            href={href}
            className="relative overflow-hidden group flex flex-col justify-between h-[300px] rounded-2xl bg-[#f5f3ee] dark:bg-brand-800 hover:-translate-y-1 transition-transform duration-300 shadow-sm no-underline select-none"
        >
            {/* 1. Container Ảnh nằm hoàn toàn ở đáy thẻ */}
            <div className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none overflow-hidden rounded-b-2xl">
                <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* 2. Lớp Gradient phủ kín 100% thẻ */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#f5f3ee] via-[#f5f3ee]/90 via-45% to-transparent dark:from-brand-800 dark:via-brand-800/90" />

            {/* 3. Nội dung chữ nổi phía trên */}
            <div className="p-5 relative z-10">
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="text-xl text-[#3a5a40] dark:text-brand-300 group-hover:scale-110 transition-transform">
                        <Icon />
                    </div>
                    <h3 className="text-base text-gray-900 dark:text-gray-100 font-display">
                        {title}
                    </h3>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                    {description}
                </p>

                {/* Nút Khám phá */}
                <div className="mt-4">
                    <span className="text-xs font-semibold text-[#3a5a40] dark:text-brand-300 inline-flex items-center gap-1 group-hover:text-[#2d4632]">
                        <span>Khám phá</span>
                        <span className="transition-transform group-hover:translate-x-1.5 duration-200" aria-hidden="true">→</span>
                    </span>
                </div>
            </div>
        </Link>
    );
}