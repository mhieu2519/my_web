import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async overview() {
        const [totalPosts, publishedPosts, draftPosts, totalComments, totalReactions, totalUsers] =
            await Promise.all([
                this.prisma.post.count(),
                this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
                this.prisma.post.count({ where: { status: 'DRAFT' } }),
                this.prisma.comment.count(),
                this.prisma.reaction.count(),
                this.prisma.user.count(),
            ]);
        return { totalPosts, publishedPosts, draftPosts, totalComments, totalReactions, totalUsers };
    }

    // Số bài viết + bình luận theo từng ngày, N ngày gần nhất
    async timeseries(days = 30) {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const posts = await this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") as day, COUNT(*)::bigint as count
      FROM "Post"
      WHERE "createdAt" >= ${since}
      GROUP BY day ORDER BY day ASC
    `;
        const comments = await this.prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT date_trunc('day', "createdAt") as day, COUNT(*)::bigint as count
      FROM "Comment"
      WHERE "createdAt" >= ${since}
      GROUP BY day ORDER BY day ASC
    `;

        const merge = (rows: { day: Date; count: bigint }[]) =>
            Object.fromEntries(rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.count)]));

        const postsMap = merge(posts);
        const commentsMap = merge(comments);

        const out: { date: string; posts: number; comments: number }[] = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
            out.push({ date: d, posts: postsMap[d] || 0, comments: commentsMap[d] || 0 });
        }
        return out;
    }
}