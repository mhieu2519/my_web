import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
    constructor(private prisma: PrismaService) { }

    async toggle(userId: string, postId: string) {
        const existing = await this.prisma.bookmark.findUnique({
            where: { userId_postId: { userId, postId } },
        });
        if (existing) {
            await this.prisma.bookmark.delete({ where: { id: existing.id } });
            return { bookmarked: false };
        }
        await this.prisma.bookmark.create({ data: { userId, postId } });
        return { bookmarked: true };
    }

    async myBookmarkedPostIds(userId: string) {
        const rows = await this.prisma.bookmark.findMany({ where: { userId }, select: { postId: true } });
        return rows.map((r) => r.postId);
    }

    async myBookmarks(userId: string, page = 1, pageSize = 10) {
        const [rows, total] = await Promise.all([
            this.prisma.bookmark.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    post: {
                        select: {
                            id: true, slug: true, title: true, excerpt: true, coverImage: true,
                            publishedAt: true, views: true,
                            author: { select: { id: true, name: true, avatarUrl: true } },
                            tags: true,
                            _count: { select: { comments: true, reactions: true } },
                        },
                    },
                },
            }),
            this.prisma.bookmark.count({ where: { userId } }),
        ]);
        return {
            items: rows.map((r) => r.post),
            total, page, pageSize, totalPages: Math.ceil(total / pageSize),
        };
    }
}