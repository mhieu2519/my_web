import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

function estimateReadTime(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function rangeToSince(range?: string): Date | undefined {
  const days: Record<string, number> = { '7': 7, '30': 30, '90': 90, '365': 365 };
  if (!range || !days[range]) return undefined;
  return new Date(Date.now() - days[range] * 24 * 60 * 60 * 1000);
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  // Sinh slug duy nhất từ 1 chuỗi gốc (dùng cho cả title mặc định lẫn slug tùy chỉnh)
  private async generateUniqueSlug(base: string, excludeId?: string) {
    const baseSlug = slugify(base, { lower: true, strict: true, locale: 'vi' });
    let slug = baseSlug;
    let i = 1;
    while (
      await this.prisma.post.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
    ) {
      slug = `${baseSlug}-${i++}`;
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
    const slug = await this.generateUniqueSlug(dto.slug || dto.title);
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
        isFeatured: dto.isFeatured ?? false,
        commentsEnabled: dto.commentsEnabled ?? true,
        authorId,
        tags: { connect: tags },
      },
      include: { tags: true, author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async findPublished(
    page = 1,
    pageSize = 10,
    tagSlug?: string,
    search?: string,
    sort: 'newest' | 'popular' = 'newest',
    range?: string,
    authorId?: string,
  ) {
    const where: any = { status: 'PUBLISHED' };
    if (tagSlug) where.tags = { some: { slug: tagSlug } };
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    const since = rangeToSince(range);
    if (since) where.publishedAt = { gte: since };

    const [rawItems, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: sort === 'popular' ? { views: 'desc' } : { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, slug: true, title: true, excerpt: true, coverImage: true,
          publishedAt: true, updatedAt: true, views: true, content: true, isFeatured: true,
          author: { select: { id: true, name: true, avatarUrl: true } },
          tags: true,
          _count: { select: { comments: true, reactions: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const items = rawItems.map(({ content, ...rest }) => ({
      ...rest,
      readTimeMinutes: estimateReadTime(content),
    }));

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findPopular(limit = 4, tagSlug?: string) {
    return this.prisma.post.findMany({
      where: { status: 'PUBLISHED', ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}) },
      orderBy: { views: 'desc' },
      take: limit,
      select: { id: true, slug: true, title: true, coverImage: true, views: true, publishedAt: true },
    });
  }

  async searchFacets(search?: string, range?: string) {
    const baseWhere: any = { status: 'PUBLISHED' };
    if (search) {
      baseWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    const since = rangeToSince(range);
    if (since) baseWhere.publishedAt = { gte: since };

    const [total, tags] = await Promise.all([
      this.prisma.post.count({ where: baseWhere }),
      this.prisma.tag.findMany({
        select: { id: true, name: true, slug: true, posts: { where: baseWhere, select: { id: true } } },
      }),
    ]);

    return {
      total,
      tags: tags
        .map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t.posts.length }))
        .sort((a, b) => b.count - a.count),
    };
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

    this.prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => { });

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

    if (dto.slug) {
      data.slug = await this.generateUniqueSlug(dto.slug, id);
    } else {
      delete data.slug;
    }

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