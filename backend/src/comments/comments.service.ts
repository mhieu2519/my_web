import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findByPost(postId: string) {
    // Lấy toàn bộ comment của bài, dựng cây reply ở tầng service để FE nhận sẵn cấu trúc lồng
    const all = await this.prisma.comment.findMany({
      where: { postId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const byId = new Map(all.map((c) => [c.id, { ...c, replies: [] as any[] }]));
    const roots: any[] = [];

    for (const c of byId.values()) {
      if (c.parentId && byId.has(c.parentId)) {
        byId.get(c.parentId)!.replies.push(c);
      } else {
        roots.push(c);
      }
    }
    return roots;
  }

  async create(userId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.postId !== dto.postId) {
        throw new NotFoundException('Không tìm thấy bình luận gốc');
      }
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        postId: dto.postId,
        parentId: dto.parentId,
        authorId: userId,
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async update(id: string, userId: string, role: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
    if (comment.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền sửa bình luận này');
    }
    return this.prisma.comment.update({ where: { id }, data: { content: dto.content } });
  }

  async remove(id: string, userId: string, role: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Không tìm thấy bình luận');
    if (comment.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền xoá bình luận này');
    }
    await this.prisma.comment.delete({ where: { id } });
    return { success: true };
  }
}
