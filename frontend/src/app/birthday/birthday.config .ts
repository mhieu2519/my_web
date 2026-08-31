// ==================== Cấu hình ảnh & lời chúc ====================
// Gom toàn bộ phần "chỉnh tay" vào 1 file để dễ sửa, không cần đụng
// vào logic bên trong BirthdayClient.tsx

// ---- Ảnh kỷ niệm ----
// 2 cách thêm ảnh (có thể trộn cả 2 trong cùng mảng):
// 1) Để file ảnh trong `public/birthday/xxx.jpg` rồi ghi '/birthday/xxx.jpg'
// 2) Dán link chia sẻ Google Drive (nhớ đặt quyền "Bất kỳ ai có link đều xem được"),
//    component sẽ tự chuyển sang link ảnh xem trực tiếp được (resolveImageSrc).
// Nếu URL trên trang (?p=...) có ảnh thì ưu tiên dùng ảnh đó, còn không thì dùng danh sách này.
export const DEFAULT_PHOTOS: string[] = [
    '/images/slide2.png',
    // '/birthday/anh1.jpg',
    // '/birthday/anh2.jpg',
    // 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/view?usp=sharing',
];

// ---- Lời chúc mặc định ----
// Mỗi lần vào trang sẽ random 1 câu trong danh sách này (chỉ random 1 lần lúc load trang).
// Nếu URL có ?m=... thì lời chúc trong URL sẽ ghi đè, không random nữa.
export function buildDefaultWishes(name: string): string[] {
    return [
        `Chúc ${name} tuổi mới thật nhiều niềm vui, sức khỏe dồi dào, mọi dự định đều thành hiện thực và luôn rực rỡ như hôm nay nhé! 🎉💖`,
        `Sinh nhật vui vẻ ${name} ơi! Mong một tuổi mới bình an, gặp nhiều may mắn và luôn giữ được nụ cười ấm áp như vậy. 🥳🌷`,
        `Chúc ${name} sinh nhật thật đặc biệt — có thêm một tuổi là có thêm một hành trình mới đầy màu sắc và hạnh phúc. 🎂✨`,
        `Happy Birthday ${name}! Chúc bạn luôn khỏe mạnh, an yên, và những điều tốt đẹp nhất sẽ luôn tìm đến. 💫🎈`,
        `${name} ơi, chúc mừng sinh nhật! Mong năm nay bạn gặt hái thật nhiều thành công và luôn được yêu thương. 🍰❤️`,
        `Một tuổi mới, một hành trình mới. Chúc ${name} luôn tự tin, mạnh mẽ và tràn đầy năng lượng nhé! 🌈🎁`,
        `Chúc ${name} sinh nhật an lành, vạn sự như ý, và luôn có những người thân yêu ở bên cạnh. 🎊🌟`,
        `Tuổi mới đến rồi, chúc ${name} luôn tươi trẻ, yêu đời và gặt hái thật nhiều điều tuyệt vời phía trước! 🥂🎀`,
    ];
}

// ---- Nhạc nền khi thổi nến (không bắt buộc) ----
// Đặt file tại `public/hpbd.mp3`. Nếu không có file, phần nhạc sẽ tự bị bỏ qua,
// không ảnh hưởng trải nghiệm.
export const BIRTHDAY_AUDIO_SRC = '/hpbd.mp3';