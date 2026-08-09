import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  private async generateUniqueSlug(title: string) {
    const base = slugify(title, { lower: true, strict: true, locale: 'vi' });
    let slug = base;
    let i = 1;
    while (await this.prisma.post.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }
    return slug;
  }

  private async resolveTags(tagNames: string[] = []) {
    const tags: { id: string }[] = [];
    for (const name of tagNames) {
      const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
      const tag = await this.prisma.tag.upsert({
        where: { slug },
        update: {},
        create: { name, slug },
      });
      tags.push({ id: tag.id });
    }
    return tags;
  }

  async create(authorId: string, dto: CreatePostDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    const tags = await this.resolveTags(dto.tags);

    return this.prisma.post.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        status: dto.status || 'DRAFT',
        publishedAt: dto.status === 'PUBLISHED' ? new Date() : null,
        authorId,
        tags: { connect: tags },
      },
      include: { tags: true, author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async findPublished(page = 1, pageSize = 10, tagSlug?: string) {
    const where: any = { status: 'PUBLISHED' };
    if (tagSlug) where.tags = { some: { slug: tagSlug } };

    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          tags: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { comments: true, reactions: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findAllForAdmin(page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: { select: { id: true, name: true } },
          tags: true,
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.post.count(),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        tags: true,
        author: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
        reactions: { select: { type: true, userId: true } },
      },
    });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    return post;
  }

  async findByIdForEdit(id: string, userId: string, role: string) {
    const post = await this.prisma.post.findUnique({ where: { id }, include: { tags: true } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    if (post.authorId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    }
    return post;
  }

  async update(id: string, userId: string, role: string, dto: UpdatePostDto) {
    const post = await this.findByIdForEdit(id, userId, role);

    const data: any = { ...dto };
    delete data.tags;

    if (dto.status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
      data.publishedAt = new Date();
    }

    if (dto.tags) {
      data.tags = { set: [], connect: await this.resolveTags(dto.tags) };
    }

    return this.prisma.post.update({
      where: { id },
      data,
      include: { tags: true, author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async remove(id: string, userId: string, role: string) {
    await this.findByIdForEdit(id, userId, role);
    await this.prisma.post.delete({ where: { id } });
    return { success: true };
  }
}
