// backend/prisma/backfillCamHung.ts
// Chạy 1 lần sau khi merge tag Du lịch/Đời sống, để gán "Cảm hứng" cho các bài
// KHÔNG có tag nào trong nhóm cốt lõi (Công nghệ / Thơ ca / Du ký / Cảm hứng).
//
// Cách chạy:
//   cd backend
//   npx ts-node prisma/backfillCamHung.ts
///<reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CORE_CATEGORY_SLUGS = ['cong-nghe', 'tho-ca', 'du-ky', 'cam-hung'];

async function main() {
    const camHung = await prisma.tag.upsert({
        where: { slug: 'cam-hung' },
        update: {},
        create: { name: 'Cảm hứng', slug: 'cam-hung' },
    });

    const posts = await prisma.post.findMany({
        select: { id: true, title: true, tags: { select: { slug: true } } },
    });

    const orphanIds = posts
        .filter((p) => !p.tags.some((t) => CORE_CATEGORY_SLUGS.includes(t.slug)))
        .map((p) => p.id);

    if (orphanIds.length === 0) {
        console.log('Không có bài nào cần gán lại — tất cả đã thuộc 1 chuyên mục cốt lõi.');
        return;
    }

    for (const id of orphanIds) {
        await prisma.post.update({
            where: { id },
            data: { tags: { connect: { id: camHung.id } } },
        });
    }

    console.log(`Đã gán tag "Cảm hứng" cho ${orphanIds.length} bài viết:`);
    posts
        .filter((p) => orphanIds.includes(p.id))
        .forEach((p) => console.log(`  - ${p.title}`));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });