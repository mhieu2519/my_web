'use client';

import { useState } from 'react';
import { PiMapPinLineLight } from "react-icons/pi";
import { FiPhone } from "react-icons/fi";
import { RiMailUnreadLine } from "react-icons/ri";


const SOCIAL_LINKS = [
    { label: 'Facebook', href: 'https://facebook.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Youtube', href: 'https://youtube.com' },
];

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const subject = encodeURIComponent(`[Liên hệ từ ${name || 'khách'}]`);
        const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
        window.location.href = `mailto:info@example.com?subject=${subject}&body=${body}`;
    }

    return (
        <main>
            {/* Hero */}
            <section className="rounded-xl2 bg-brand-gradient text-white text-center py-16 px-6 mb-10 -mx-4 md:mx-0">
                <h1 className="text-3xl md:text-4xl font-extrabold">Liên hệ với mình</h1>
                <p className="mt-4 text-white/90 max-w-lg mx-auto leading-relaxed">
                    Có góp ý, hợp tác, hay chỉ đơn giản muốn trò chuyện về văn chương, du ký?
                    Mình luôn sẵn lòng lắng nghe.
                </p>
            </section>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* Contact info */}
                <div className="card p-8 space-y-6">
                    <h2 className="text-xl font-bold">Thông tin liên hệ</h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <span className="text-xl"><PiMapPinLineLight /></span>
                            <div>
                                <div className="text-sm font-medium text-gray-800">Địa chỉ</div>
                                <div className="text-sm text-gray-500">Hà Nội, Việt Nam</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl"><FiPhone /></span>
                            <div>
                                <div className="text-sm font-medium text-gray-800">Điện thoại</div>
                                <a href="tel:0900000000" className="text-sm text-brand-600 hover:underline">
                                    0900 000 000
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-xl"><RiMailUnreadLine /></span>
                            <div>
                                <div className="text-sm font-medium text-gray-800">Email</div>
                                <a href="mailto:info@example.com" className="text-sm text-brand-600 hover:underline">
                                    info@example.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <div className="text-sm font-medium text-gray-800 mb-3">Kết nối với mình</div>
                        <div className="flex gap-2">
                            {SOCIAL_LINKS.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm bg-brand-50 text-brand-700 px-3.5 py-1.5 rounded-full font-medium hover:bg-brand-100 transition-colors"
                                >
                                    {s.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact form */}
                <div className="card p-8">
                    <h2 className="text-xl font-bold mb-5">Gửi lời nhắn</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Tên của bạn</label>
                            <input
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">Lời nhắn</label>
                            <textarea
                                required
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-brand-400 focus:outline-none transition-colors resize-none"
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            Gửi lời nhắn
                        </button>
                    </form>
                </div>
            </div>

            {/* Map */}
            <div className="card overflow-hidden">
                <iframe
                    src="https://maps.google.com/maps?q=H%C3%A0%20N%E1%BB%99i%2C%20Vi%E1%BB%87t%20Nam&t=m&z=12&output=embed&iwloc=near"
                    width="100%"
                    height="360"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bản đồ"
                />
            </div>
        </main>
    );
}