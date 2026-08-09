# Personal Blog — Backend (NestJS) + Frontend (Next.js)

Kiến trúc tách rời: backend độc lập (deploy được Railway/Render/VPS), frontend độc lập (deploy Vercel).

## 1. Chuẩn bị hạ tầng (miễn phí để bắt đầu)

1. **Database**: tạo project Postgres miễn phí tại [neon.tech](https://neon.tech) → copy connection string.
2. **Lưu ảnh**: tạo tài khoản miễn phí tại [cloudinary.com](https://cloudinary.com) (25 credit/tháng, **không cần thẻ**):
   - Đăng ký tài khoản → vào **Dashboard** (trang đầu tiên sau khi đăng nhập)
   - Ngay đầu trang sẽ thấy 3 giá trị: **Cloud name**, **API Key**, **API Secret** — bấm icon con mắt để hiện API Secret
   - Copy cả 3 giá trị này, dán vào `backend/.env` (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
   - Không cần tạo bucket hay bật public access thủ công — Cloudinary tự động public URL ảnh sau khi upload

## 2. Chạy Backend

```bash
cd backend
npm install
cp .env.example .env
# Mở .env, điền DATABASE_URL, JWT_ACCESS_SECRET (chuỗi random dài), R2_*

npx prisma migrate dev --name init   # tạo bảng trong DB
npm run seed                          # tạo tài khoản admin đầu tiên

npm run start:dev                     # chạy dev server tại http://localhost:4000/api
```

Tài khoản admin mặc định (đổi trong `.env` trước khi seed):
- Email: `admin@example.com`
- Mật khẩu: `ChangeMe123!` — **đổi ngay sau khi đăng nhập lần đầu**

## 3. Chạy Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000/api (mặc định đã đúng cho local)

npm run dev    # chạy tại http://localhost:3000
```

## 3b. Hoặc chạy bằng Docker (khuyến nghị khi test giống môi trường production / chuẩn bị lên VPS)

Chỉ cần `backend/.env` đã điền đầy đủ (bước 2), Docker lo phần còn lại — không cần cài Node trên máy.

```bash
# Ở thư mục gốc dự án (personal-blog/)
cp .env.example .env
# sửa NEXT_PUBLIC_API_URL trong .env nếu deploy thật (trỏ về domain backend)

docker compose up -d --build
```

- Backend: `http://localhost:4000/api`
- Frontend: `http://localhost:3000`

Chạy migrate + seed admin lần đầu (bên trong container backend):

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

Xem log: `docker compose logs -f backend` (hoặc `frontend`)
Dừng: `docker compose down`
Build lại sau khi sửa code: `docker compose up -d --build`

**Test không cần Neon**: mở `docker-compose.yml`, bỏ comment khối `db` (Postgres local), đổi `DATABASE_URL` trong `backend/.env` thành `postgresql://postgres:postgres@db:5432/blog`, rồi `docker compose up -d --build` — có ngay Postgres chạy trong container, không phụ thuộc Neon khi dev offline.

## 4. Thử nghiệm luồng cơ bản

1. Mở `http://localhost:3000/login`, đăng nhập bằng tài khoản admin đã seed
2. Vào `/admin/dashboard` → **Viết bài mới**
3. Nhập tiêu đề, nội dung (dùng toolbar để chèn ảnh — ảnh upload thẳng lên R2)
4. Bấm **Đăng bài**
5. Quay lại trang chủ `/` — bài viết đã publish sẽ hiện ra
6. Mở bài viết, thử thả icon cảm xúc và viết bình luận (cần đăng nhập)

## 5. Deploy

**VPS riêng (khuyến nghị nhờ đã có Docker)**:
1. Cài Docker + Docker Compose trên VPS (`curl -fsSL https://get.docker.com | sh`)
2. Clone repo lên VPS, tạo `backend/.env` và `.env` (root) với giá trị thật
3. `docker compose up -d --build`
4. Chạy migrate: `docker compose exec backend npx prisma migrate deploy`
5. Gắn Nginx (hoặc Caddy) làm reverse proxy trỏ domain vào port 3000 (frontend) và một domain con (vd `api.tenban.com`) vào port 4000 (backend), bật HTTPS qua Let's Encrypt/Certbot

**Backend riêng lẻ** (không dùng Docker, chọn 1):
- Railway/Render: connect repo, set env vars giống `.env`, build command `npm run build`, start command `npm run start:prod` (nhớ chạy `npx prisma migrate deploy` trong quá trình build/release)

**Frontend riêng lẻ**:
- Vercel: import repo, set `NEXT_PUBLIC_API_URL` trỏ về domain backend đã deploy (vd: `https://api.tenban.com/api`)

## 6. Cấu trúc thư mục

```
personal-blog/
  docker-compose.yml        # điều phối backend + frontend
  .env.example               # build args cho docker-compose
  backend/
    Dockerfile
    prisma/schema.prisma     # data model
    src/
      auth/                  # JWT + refresh token
      users/
      posts/
      comments/
      reactions/
      upload/                 # Cloudinary signed upload
  frontend/
    Dockerfile
    src/
      app/                    # Next.js App Router pages
      components/             # ReactionBar, CommentSection, PostEditor, Header
      hooks/useAuth.tsx        # auth context
      lib/api-client.ts        # axios + auto refresh token
      lib/upload.ts             # Cloudinary upload helper
```

## 7. Việc cần làm tiếp (gợi ý mở rộng)

- Trang public xem hồ sơ tác giả, danh sách bài theo tag
- Phân trang UI ở trang chủ (backend đã hỗ trợ `page`/`pageSize`)
- Rate-limit riêng cho endpoint comment/reaction để chống spam
- Thông báo (email hoặc trong app) khi có bình luận mới
- SEO: sitemap.xml, meta OpenGraph cho từng bài viết
- Test (Jest cho backend, Playwright cho frontend)

## Tạo chuỗi
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

```
