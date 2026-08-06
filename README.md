# Personal Blog — Backend (NestJS) + Frontend (Next.js)

Kiến trúc tách rời: backend độc lập (deploy được Railway/Render/VPS), frontend độc lập (deploy Vercel).

## 1. Chuẩn bị hạ tầng (miễn phí để bắt đầu)

1. **Database**: tạo project Postgres miễn phí tại [neon.tech](https://neon.tech) hoặc [supabase.com](https://supabase.com) → copy connection string.
2. **Lưu ảnh**: tạo bucket tại [Cloudflare R2](https://dash.cloudflare.com) (free 10GB, không phí egress):
   - Tạo bucket, ví dụ `personal-blog-images`
   - Vào **R2 → Manage API tokens** → tạo Access Key + Secret Key
   - Bật **Public Access** cho bucket, copy URL public dạng `https://pub-xxxx.r2.dev`

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

## 4. Thử nghiệm luồng cơ bản

1. Mở `http://localhost:3000/login`, đăng nhập bằng tài khoản admin đã seed
2. Vào `/admin/dashboard` → **Viết bài mới**
3. Nhập tiêu đề, nội dung (dùng toolbar để chèn ảnh — ảnh upload thẳng lên R2)
4. Bấm **Đăng bài**
5. Quay lại trang chủ `/` — bài viết đã publish sẽ hiện ra
6. Mở bài viết, thử thả icon cảm xúc và viết bình luận (cần đăng nhập)

## 5. Deploy

**Backend** (chọn 1):
- Railway/Render: connect repo, set env vars giống `.env`, build command `npm run build`, start command `npm run start:prod` (nhớ chạy `npx prisma migrate deploy` trong quá trình build/release)
- VPS riêng: dùng Docker hoặc PM2, reverse proxy qua Nginx, HTTPS qua Let's Encrypt

**Frontend**:
- Vercel: import repo, set `NEXT_PUBLIC_API_URL` trỏ về domain backend đã deploy (vd: `https://api.tenban.com/api`)

## 6. Cấu trúc thư mục

```
backend/
  prisma/schema.prisma     # data model
  src/
    auth/                  # JWT + refresh token
    users/
    posts/
    comments/
    reactions/
    upload/                 # presigned URL cho R2
frontend/
  src/
    app/                    # Next.js App Router pages
    components/             # ReactionBar, CommentSection, PostEditor, Header
    hooks/useAuth.tsx        # auth context
    lib/api-client.ts        # axios + auto refresh token
```

## 7. Việc cần làm tiếp (gợi ý mở rộng)

- Trang public xem hồ sơ tác giả, danh sách bài theo tag
- Phân trang UI ở trang chủ (backend đã hỗ trợ `page`/`pageSize`)
- Rate-limit riêng cho endpoint comment/reaction để chống spam
- Thông báo (email hoặc trong app) khi có bình luận mới
- SEO: sitemap.xml, meta OpenGraph cho từng bài viết
- Test (Jest cho backend, Playwright cho frontend)
