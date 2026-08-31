'use client';

import React from 'react';

export default function CVPage() {
    const handleDownloadPDF = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 text-gray-800 print:bg-white print:py-0 print:px-0">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 border border-gray-100 print:shadow-none print:border-none print:p-0">

                {/* Nút Tải PDF (Sẽ ẩn đi khi thực hiện in / xuất PDF) */}
                <div className="flex justify-end mb-6 print:hidden">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow transition-colors cursor-pointer"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Tải bản PDF
                    </button>
                </div>

                {/* Header / Thông tin cá nhân */}
                <header className="border-b border-gray-200 pb-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <img src="./images/slide1.png" alt="ảnh thẻ" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">NGUYỄN MINH HIẾU</h1>
                            <p className="text-lg text-indigo-600 font-medium mt-1">Full-Stack / Embedded Systems Software Engineer</p>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Email:</strong> nguyenminhhieu2000hd@gmail.com</p>
                        <p><strong>GitHub:</strong> github.com/mhieu2519</p>
                        <p><strong>Địa chỉ:</strong> Nam Đồng, Hải Phòng, Việt Nam</p>
                    </div>
                </header>

                {/* Giới thiệu bản thân */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-indigo-500 pb-1 mb-3 inline-block">
                        Giới thiệu
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                        Kỹ sư phần mềm có định hướng chuyên sâu về phát triển hệ thống web full-stack và tích hợp phần cứng/nhúng. Kinh nghiệm làm việc thực tế với React, Next.js, Docker, cùng khả năng xử lý bài toán từ việc dựng API backend, quản lý cơ sở dữ liệu đến lập trình vi điều khiển.
                    </p>
                </section>

                {/* Kỹ năng chuyên môn */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-indigo-500 pb-1 mb-4 inline-block">
                        Kỹ năng chuyên môn
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-200">
                            <h3 className="font-semibold text-indigo-600 mb-2">Web Development</h3>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                <li>Frontend: Next.js, React, Tailwind CSS, TypeScript</li>
                                <li>Backend: Node.js, Express, RESTful APIs</li>
                                <li>Deployment: Docker, Vercel, Ubuntu Server</li>
                            </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-200">
                            <h3 className="font-semibold text-indigo-600 mb-2">Embedded Systems & Hardware</h3>
                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                <li>Microcontrollers: ESP32, STM32, C/C++</li>
                                <li>Mô phỏng & Thiết kế: Proteus, Altium</li>
                                <li>Hệ thống nhúng Linux: Armbian / Single Board Computers</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Dự án tiêu biểu */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-indigo-500 pb-1 mb-4 inline-block">
                        Dự án tiêu biểu
                    </h2>
                    <div className="space-y-6">

                        {/* Project 1 */}
                        <div>
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-lg font-bold text-gray-800">Hệ thống Giám sát & Bản đồ Đường sắt</h3>
                                <span className="text-sm text-gray-500">2026</span>
                            </div>
                            <p className="text-sm font-medium text-indigo-600 mb-1">Docker, GeoServer, Next.js, REST API</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                <li>Triển khai máy chủ bản đồ đường sắt trên môi trường Linux Ubuntu sử dụng Docker Compose.</li>
                                <li>Xây dựng API tích hợp giao tiếp dữ liệu định vị và hiển thị hạ tầng đường sắt theo thời gian thực.</li>
                            </ul>
                        </div>

                        {/* Project 2 */}
                        <div>
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-lg font-bold text-gray-800">Website Cá nhân & Blog Kỹ thuật</h3>
                                <span className="text-sm text-gray-500">2025 - 2026</span>
                            </div>
                            <p className="text-sm font-medium text-indigo-600 mb-1">Next.js, TypeScript, Tailwind CSS, Vercel</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                <li>Phát triển trang blog chia sẻ kiến thức công nghệ và tích hợp Vercel Analytics theo dõi lưu lượng.</li>
                                <li>Tối ưu trải nghiệm người dùng và SEO trên nền tảng Next.js App Router.</li>
                            </ul>
                        </div>

                    </div>
                </section>

                {/* Học vấn */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-indigo-500 pb-1 mb-3 inline-block">
                        Học vấn
                    </h2>
                    <div>
                        <h3 className="text-base font-bold text-gray-800">Kỹ sư Điện tử Viễn thông</h3>
                        <p className="text-sm text-gray-600">Chuyên ngành kỹ thuật Thông tin Truyền thông</p>
                    </div>
                </section>

            </div>
        </div>
    );
}