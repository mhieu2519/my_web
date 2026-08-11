'use client';

import { useState } from 'react';
import { FaFacebook, FaXTwitter, FaLink } from 'react-icons/fa6';

export default function ShareButtons({ url, title }: { url: string; title: string }) {
    const [copied, setCopied] = useState(false);

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // trình duyệt không hỗ trợ clipboard API — bỏ qua
        }
    }

    return (
        <div className="flex sm:flex-col gap-2 sm:items-center">
            {/* Nút Facebook - Đã thêm thẻ mở <a> */}
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 flex items-center justify-center transition-colors"
                aria-label="Chia sẻ lên Facebook"
            >
                <FaFacebook size={16} />
            </a>

            {/* Nút X/Twitter - Đã thêm thẻ mở <a> */}
            <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 flex items-center justify-center transition-colors"
                aria-label="Chia sẻ lên X"
            >
                <FaXTwitter size={15} />
            </a>

            {/* Nút Copy Link */}
            <button
                type="button"
                onClick={copyLink}
                className="w-9 h-9 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 flex items-center justify-center transition-colors relative"
                aria-label="Sao chép liên kết"
            >
                <FaLink size={14} />
                {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] px-2 py-1 rounded-md whitespace-nowrap">
                        Đã sao chép
                    </span>
                )}
            </button>
        </div>
    );
}