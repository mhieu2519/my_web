'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PolaroidSliderProps {
    images: string[];
    interval?: number;
}

export default function PolaroidSlider({
    images = [],
    interval = 4000,
}: PolaroidSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);
        return () => clearInterval(timer);
    }, [images, interval]);

    if (!images || images.length === 0) return null;

    return (
        <div className="relative w-full h-[380px] sm:h-[420px] md:h-[460px] flex items-center justify-center">
            {/* Lớp nền xếp đống phía sau 1 */}
            <div className="absolute w-[97%] h-[95%] bg-white/90 dark:bg-gray-800/90 shadow-md rounded-sm rotate-[3.5deg] translate-x-2 translate-y-1 pointer-events-none transition-all duration-500" />

            {/* Lớp nền xếp đống phía sau 2 */}
            <div className="absolute w-[98%] h-[96%] bg-white/95 dark:bg-gray-800/95 shadow-sm rounded-sm -rotate-[2.5deg] -translate-x-1.5 translate-y-0.5 pointer-events-none transition-all duration-500" />

            {/* Khung Polaroid chính - Đưa p-2 đồng đều cả 4 phía để viền dưới cực sát */}
            <div className="relative w-full h-[98%] bg-white dark:bg-gray-800 p-2 shadow-xl rounded-sm -rotate-[0.5deg] transition-transform duration-500 hover:rotate-0 flex flex-col justify-between">

                {/* Băng keo dán (Washi Tape) mờ nhẹ tự nhiên */}
                <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#e2d7c5]/70 backdrop-blur-[1px] shadow-sm rotate-[-20deg] z-30 pointer-events-none"
                    style={{
                        clipPath: 'polygon(2% 0%, 0% 12%, 2% 25%, 0% 38%, 3% 50%, 1% 65%, 3% 80%, 0% 92%, 2% 100%, 98% 100%, 100% 88%, 97% 75%, 99% 60%, 97% 45%, 100% 30%, 98% 15%, 100% 0%)'
                    }}
                >
                    {/* Hiệu ứng bóng mờ nhẹ 2 bên mép xé */}
                    <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/5 to-transparent" />
                    <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-l from-black/5 to-transparent" />
                </div>

                {/* Khung chứa ảnh */}
                <div className="relative w-full h-full overflow-hidden rounded-[2px] bg-gray-100">
                    {images.map((src, index) => (
                        <div
                            key={src + index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                        >
                            <Image
                                src={src}
                                alt={`Slide ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 60vw"
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    ))}

                    {/* Dots chuyển ảnh đè trực tiếp lên góc dưới bên phải ảnh (Overlay) */}
                    <div className="absolute bottom-2.5 right-2.5 z-20 flex gap-1.5 items-center bg-black/20 backdrop-blur-[2px] px-2 py-1 rounded-full">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                    ? 'w-3.5 bg-white'
                                    : 'w-1.5 bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}