import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) { }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true,
        isBanned: true, emailVerified: true, createdAt: true, monthlyPostLimit: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  // Hồ sơ công khai — dùng cho trang /authors/:id
  async findPublicProfile(id: number, viewerId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, avatarUrl: true, bio: true, location: true,
        websiteUrl: true, facebookUrl: true, instagramUrl: true, githubUrl: true,
        role: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Không tìm thấy tác giả');

    const [postCount, viewsAgg, totalLikes, followersCount, followingRow] = await Promise.all([
      this.prisma.post.count({ where: { authorId: id, status: 'PUBLISHED' } }),
      this.prisma.post.aggregate({ where: { authorId: id, status: 'PUBLISHED' }, _sum: { views: true } }),
      this.prisma.reaction.count({ where: { post: { authorId: id } } }),
      this.prisma.follow.count({ where: { followingId: id } }),
      viewerId
        ? this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: id } } })
        : Promise.resolve(null),
    ]);

    return {
      ...user,
      stats: {
        postCount,
        totalViews: viewsAgg._sum.views || 0,
        totalLikes,
        followersCount,
      },
      isFollowing: !!followingRow,
    };
  }

  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestException('Không thể tự theo dõi chính mình');
    }
    const target = await this.prisma.user.findUnique({ where: { id: followingId } });
    if (!target) throw new NotFoundException('Không tìm thấy tác giả');

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      await this.prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }
    await this.prisma.follow.create({ data: { followerId, followingId } });
    return { following: true };
  }

  async updateProfile(id: number, data: {
    name?: string; avatarUrl?: string; bio?: string; location?: string;
    websiteUrl?: string; facebookUrl?: string; instagramUrl?: string; githubUrl?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { id }, select: { avatarUrl: true } });

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true,
        bio: true, location: true, websiteUrl: true, facebookUrl: true, instagramUrl: true, githubUrl: true,
      },
    });

    // Đổi avatar -> dọn ảnh cũ trên Cloudinary (chạy nền, không chặn response)
    if (data.avatarUrl !== undefined && existing?.avatarUrl && existing.avatarUrl !== data.avatarUrl) {
      this.uploadService.deleteImage(existing.avatarUrl).catch(() => { });
    }

    return updated;
  }
  async setRole(id: number, role: 'ADMIN' | 'USER') {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async setBanned(id: number, isBanned: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isBanned },
      select: { id: true, email: true, name: true, role: true, isBanned: true },
    });
  }

  async remove(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async setMonthlyPostLimit(id: number, limit: number) {
    return this.prisma.user.update({
      where: { id },
      data: { monthlyPostLimit: limit },
      select: { id: true, email: true, name: true, monthlyPostLimit: true },
    });
  }
  // Admin gán lại 1 id (còn trống, do bị xoá/ban trước đó) cho 1 user khác
  async reassignId(currentId: number, newId: number) {
    if (newId < 0) throw new BadRequestException('ID không hợp lệ');
    if (currentId === newId) return this.findById(currentId);

    const target = await this.prisma.user.findUnique({ where: { id: currentId } });
    if (!target) throw new NotFoundException('Không tìm thấy người dùng');

    const clash = await this.prisma.user.findUnique({ where: { id: newId } });
    if (clash) throw new BadRequestException(`ID ${newId} đang được sử dụng bởi tài khoản khác`);

    const updated = await this.prisma.user.update({ where: { id: currentId }, data: { id: newId } });

    // Tránh sequence tự tăng sau này va vào id vừa gán thủ công
    await this.prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), (SELECT MAX(id) FROM "User"))`;

    return { id: updated.id, email: updated.email, name: updated.name };
  }

}


