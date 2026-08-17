import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

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

  // Số bài đã "gửi duyệt/đăng" trong tháng hiện tại (không tính DRAFT) — tự reset theo tháng
  async getQuota(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (user.role === 'ADMIN') {
      return { unlimited: true, limit: null as number | null, used: 0, remaining: Infinity };
    }
    const used = await this.prisma.post.count({
      where: {
        authorId: userId,
        createdAt: { gte: startOfCurrentMonth() },
        status: { not: 'DRAFT' },
      },
    });
    return {
      unlimited: false,
      limit: user.monthlyPostLimit as number | null,
      used,
      remaining: Math.max(0, user.monthlyPostLimit - used),
    };
  }

  async create(authorId: string, dto: CreatePostDto, role: string) {
    let status: CreatePostDto['status'] = dto.status || 'DRAFT';

    if (role !== 'ADMIN') {
      // User thường không được tự publish/reject — chỉ được lưu nháp hoặc gửi duyệt
      if (status !== 'DRAFT') status = 'PENDING';

      if (status === 'PENDING') {
        const quota = await this.getQuota(authorId);
        if (!quota.unlimited && quota.remaining <= 0) {
          throw new BadRequestException(
            `Bạn đã đạt giới hạn ${quota.limit} bài gửi duyệt trong tháng này. Vui lòng thử lại vào tháng sau.`,
          );
        }
      }
    }

    const slug = await this.generateUniqueSlug(dto.slug || dto.title);
    const tags = await this.resolveTags(dto.tags);

    return this.prisma.post.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        coverImage: dto.coverImage,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        isFeatured: role === 'ADMIN' ? (dto.isFeatured ?? false) : false,
        commentsEnabled: dto.commentsEnabled ?? true,
        isPrivate: dto.isPrivate ?? false,
        authorId,
        tags: { connect: tags },
      },
      include: { tags: true, author: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  // Bài công khai — kèm lọc private theo viewer
  async findPublished(
    page = 1,
    pageSize = 10,
    tagSlug?: string,
    search?: string,
    sort: 'newest' | 'popular' = 'newest',
    range?: string,
    authorId?: string,
    viewerId?: string,
    viewerRole?: string,
  ) {
    const where: any = { status: 'PUBLISHED' };
    if (tagSlug) where.tags = { some: { slug: tagSlug } };
    if (authorId) where.authorId = authorId;

    const andClauses: any[] = [];
    if (search) {
      andClauses.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    if (viewerRole !== 'ADMIN') {
      andClauses.push({
        OR: viewerId ? [{ isPrivate: false }, { authorId: viewerId }] : [{ isPrivate: false }],
      });
    }
    if (andClauses.length) where.AND = andClauses;

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
          isPrivate: true,
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
      where: { status: 'PUBLISHED', isPrivate: false, ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}) },
      orderBy: { views: 'desc' },
      take: limit,
      select: { id: true, slug: true, title: true, coverImage: true, views: true, publishedAt: true },
    });
  }

  async searchFacets(search?: string, range?: string) {
    const baseWhere: any = { status: 'PUBLISHED', isPrivate: false };
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

  async findAllForAdmin(page = 1, pageSize = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          author: { select: { id: true, name: true } },
          tags: true,
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // Bài của chính user (mọi trạng thái) — dùng cho trang "Bài viết của tôi"
  async findMine(userId: string, page = 1, pageSize = 10) {
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { tags: true, _count: { select: { comments: true } } },
      }),
      this.prisma.post.count({ where: { authorId: userId } }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findBySlug(slug: string, viewerId?: string, viewerRole?: string) {
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

    const isOwnerOrAdmin = viewerRole === 'ADMIN' || post.authorId === viewerId;
    if (post.status !== 'PUBLISHED' && !isOwnerOrAdmin) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    if (post.isPrivate && !isOwnerOrAdmin) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    if (post.status === 'PUBLISHED') {
      this.prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => { });
    }

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

    if (role !== 'ADMIN') {
      // User thường không được tự chuyển bài sang PUBLISHED/REJECTED
      if (dto.status === 'PUBLISHED' || dto.status === 'REJECTED') {
        throw new ForbiddenException('Chỉ quản trị viên mới có thể duyệt bài viết');
      }
      if (dto.status === 'PENDING' && post.status !== 'PENDING') {
        const quota = await this.getQuota(userId);
        if (!quota.unlimited && quota.remaining <= 0) {
          throw new BadRequestException(
            `Bạn đã đạt giới hạn ${quota.limit} bài gửi duyệt trong tháng này. Vui lòng thử lại vào tháng sau.`,
          );
        }
      }
      delete data.isFeatured; // chỉ admin mới được ghim bài nổi bật
    }

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