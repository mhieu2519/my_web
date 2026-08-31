const SECTIONS = [
    {
        title: '1. Dữ liệu chúng tôi thu thập',
        content: [
            'Email, tên, ảnh đại diện từ tài khoản của bạn (đăng ký trực tiếp hoặc qua Google).',
            'Thông tin bạn cung cấp qua bình luận và bài viết.',
        ],
    },
    {
        title: '2. Cách chúng tôi sử dụng thông tin',
        content: [
            'Để cá nhân hóa trải nghiệm người dùng.',
            'Để liên hệ bạn khi cần phản hồi hoặc hỗ trợ.',
        ],
    },
    {
        title: '3. Chia sẻ dữ liệu',
        content: [
            'Chúng tôi không bán hoặc chia sẻ dữ liệu người dùng với bên thứ ba, ngoại trừ khi được yêu cầu bởi pháp luật.',
        ],
    },
    {
        title: '4. Cookie',
        content: [
            'Chúng tôi có thể sử dụng cookie để cải thiện trải nghiệm người dùng (ví dụ: ghi nhớ trạng thái đăng nhập).',
        ],
    },
    {
        title: '5. Bảo mật',
        content: [
            'Dữ liệu được lưu trữ an toàn trên hệ thống máy chủ có bảo vệ, chỉ có quyền truy cập với các tài khoản được ủy quyền.',
        ],
    },
    {
        title: '6. Quyền của bạn',
        content: [
            'Bạn có quyền yêu cầu xoá dữ liệu cá nhân bất cứ lúc nào bằng cách liên hệ với quản trị viên.',
        ],
    },
];

export default function PrivacyPage() {
    return (
        <main>
            <h1 className="text-3xl font-bold mb-8 heading-gradient inline-block">🔐 Chính sách bảo mật</h1>

            <div className="space-y-5">
                {SECTIONS.map((s) => (
                    <section key={s.title} className="card p-6 bg-transparent">
                        <h2 className="text-lg font-bold mb-2.5 text-gray-800">{s.title}</h2>
                        <div className="space-y-1.5">
                            {s.content.map((line, i) => (
                                <p key={i} className="text-gray-600 leading-relaxed">{line}</p>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}