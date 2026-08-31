const SECTIONS = [
    {
        title: '1. Chấp nhận điều khoản',
        content: ['Khi sử dụng Lặng 24, bạn đồng ý tuân thủ các điều khoản được quy định tại đây.'],
    },
    {
        title: '2. Tài khoản',
        content: ['Bạn cần đăng nhập để đăng bài hoặc bình luận. Mọi hành vi sai phạm sẽ bị xử lý và có thể bị khoá tài khoản.'],
    },
    {
        title: '3. Nội dung',
        content: ['Bạn chịu trách nhiệm cho nội dung bạn đăng. Không đăng tải nội dung vi phạm pháp luật hoặc thuần phong mỹ tục.'],
    },
    {
        title: '4. Quyền hạn',
        content: ['Quản trị viên có quyền chỉnh sửa hoặc xoá nội dung vi phạm mà không cần thông báo trước.'],
    },
    {
        title: '5. Sử dụng hợp lý',
        content: ['Không được tấn công hệ thống, spam, hay sử dụng bot nhằm phá hoại nền tảng.'],
    },
    {
        title: '6. Liên hệ',
        content: ['Nếu bạn có câu hỏi hay khiếu nại, hãy liên hệ quản trị viên để được hỗ trợ.'],
    },
];

export default function TermsPage() {
    return (
        <main>
            <h1 className="text-3xl font-bold mb-8 heading-gradient inline-block">📜 Điều khoản sử dụng</h1>

            <div className="space-y-5">
                {SECTIONS.map((s) => (
                    <section key={s.title} className="card p-6 bg-transparent">
                        <h2 className="text-lg font-bold mb-2.5 text-gray-800">{s.title}</h2>
                        {s.content.map((line, i) => (
                            <p key={i} className="text-gray-600 leading-relaxed">{line}</p>
                        ))}
                    </section>
                ))}
            </div>
        </main>
    );
}