'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Typewriter from 'typewriter-effect';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';

export default function AboutPage() {
    return (
        <ParallaxProvider>
            <div className="-mx-4 md:-mx-[calc((100vw-48rem)/2)]">
                {/* Hero */}
                <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
                    <Image
                        src="/images/hero-poetry.jpg"
                        alt="Hero"
                        fill
                        className="object-cover brightness-[0.55] object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent" />
                    <div className="relative z-10 max-w-2xl px-6">
                        <motion.h1
                            className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg min-h-[120px] flex items-center justify-center"
                            initial={{ y: -40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Typewriter
                                options={{
                                    strings: [
                                        'Đi và viết...',
                                        'Những chuyến đi...',
                                        'Văn học – Thơ ca',
                                        'Để chạm đến những điều tươi đẹp nhất',
                                        'Lưu giữ khoảnh khắc...',
                                    ],
                                    autoStart: true,
                                    loop: true,
                                    delay: 90,
                                    deleteSpeed: 40,
                                }}
                            />
                        </motion.h1>
                    </div>
                </section>

                <div className="max-w-3xl mx-auto px-4">
                    {/* About me */}
                    <section className="py-16 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <Image
                                src="/images/avatar-writer.png"
                                alt="Tác giả"
                                width={120}
                                height={120}
                                className="rounded-full mx-auto ring-4 ring-brand-100 shadow-card object-cover"
                            />
                            <h2 className="text-2xl font-bold mt-5 heading-gradient inline-block">Mình là Hiếu</h2>
                            <p className="mt-4 text-gray-600 leading-relaxed whitespace-pre-line max-w-xl mx-auto">
                                {`Yêu văn chương, đam mê khám phá, mình viết để giữ lại những khoảnh khắc, cảm xúc và hành trình.
Tuổi trẻ có ai từng đơn độc? Bước chân dài dưới những vì sao...
Khi bạn chẳng có gì, sẽ chẳng ai muốn nghe về cuộc đời của bạn cả.
Tôi vui vì mình không trong số đó!
Cảm ơn vì đã theo dõi câu chuyện của tôi.`}
                            </p>
                        </motion.div>
                    </section>

                    {/* Writing journey */}
                    <motion.section
                        className="card p-8 mb-12"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-xl font-bold mb-5 text-center">📜 Hành trình viết lách</h3>
                        <ul className="space-y-3">
                            {[
                                ['2013', 'Những bài viết đầu tiên được biết đến và ghi nhận'],
                                ['2017', 'Bài thơ đầu tiên xuất hiện trên mạng xã hội'],
                                ['2019', 'Hành trình đầu tiên đến nơi xa, những bài thơ mới'],
                                ['2020', 'Bắt đầu ấp ủ và soạn ebook đầu tay'],
                                ['20..', 'Sẽ còn tiếp tục...'],
                            ].map(([year, text]) => (
                                <li key={year} className="flex gap-4 items-start">
                                    <span className="badge-gradient shrink-0">{year}</span>
                                    <span className="text-gray-600 pt-0.5">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.section>

                    {/* Places */}
                    <motion.section
                        className="card p-8 mb-12 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-xl font-bold mb-3">🌍 Những nơi mình đã đi qua</h3>
                        <p className="text-gray-600 mb-5">
                            Mình từng đặt chân đến Hòa Bình, Thái Nguyên, Thanh Hóa... Mỗi nơi là một miền ký ức.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['Hòa Bình', 'Thái Nguyên', 'Thanh Hóa', 'Hà Nội', 'Sa Pa'].map((place) => (
                                <span key={place} className="text-sm bg-brand-50 text-brand-700 px-3.5 py-1.5 rounded-full font-medium">
                                    📍 {place}
                                </span>
                            ))}
                        </div>
                    </motion.section>

                    {/* Music */}
                    <motion.section
                        className="card p-8 mb-12 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-xl font-bold mb-3">🎸 Góc âm nhạc – Bức Tường</h3>
                        <p className="text-gray-600 mb-5">
                            Mình là fan của ban nhạc Bức Tường – âm nhạc của họ đã đồng hành cùng mình trong nhiều chuyến đi và những khoảnh khắc viết lách.
                        </p>
                        <div className="rounded-xl2 overflow-hidden shadow-card">
                            <iframe
                                width="100%"
                                height="360"
                                src="https://www.youtube.com/embed/4RgCllKvJuc?si=a1q7akSMu4-E5F-O"
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                    </motion.section>
                </div>

                {/* Parallax quote */}
                <section className="relative h-[50vh] mb-16 overflow-hidden">
                    <Parallax speed={-15}>
                        <div
                            className="h-[65vh] bg-cover bg-center bg-no-repeat opacity-80"
                            style={{ backgroundImage: "url('/images/parallax.jpg')" }}
                        />
                    </Parallax>
                    <div className="absolute inset-0 bg-brand-900/40 flex items-center justify-center z-10 px-6">
                        <p className="text-white text-2xl md:text-3xl font-semibold text-center max-w-xl">
                            "Viết – không phải để nổi tiếng, mà để sống thêm lần nữa."
                        </p>
                    </div>
                </section>

                <div className="max-w-3xl mx-auto px-4">
                    {/* Categories */}
                    <section className="mb-16">
                        <h3 className="text-2xl font-bold text-center mb-8 heading-gradient inline-block w-full">
                            Mình thường viết về
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                ['📖', 'Văn học', 'Cảm nhận, trích đoạn, tác phẩm yêu thích'],
                                ['✈️', 'Du lịch', 'Ký sự rong chơi, những góc nhìn mới'],
                                ['📝', 'Thơ ca', 'Chữ nghĩa đi vào hồn, gió thổi thành thơ'],
                            ].map(([icon, title, desc], i) => (
                                <motion.div
                                    key={title}
                                    className="card p-6 text-center"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="text-3xl mb-2">{icon}</div>
                                    <h4 className="font-bold text-gray-800">{title}</h4>
                                    <p className="mt-1.5 text-sm text-gray-500">{desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    <footer className="text-center text-brand-600 font-semibold py-6">
                        ~ Lưu lại những điều đẹp đẽ bằng con chữ ~
                    </footer>
                </div>
            </div>
        </ParallaxProvider>
    );
}