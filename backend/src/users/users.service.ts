import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true,
        isBanned: true, emailVerified: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return user;
  }

  // Hồ sơ công khai — dùng cho trang /authors/:id
  async findPublicProfile(id: string, viewerId?: string) {
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

  async toggleFollow(followerId: string, followingId: string) {
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

  async updateProfile(id: string, data: {
    name?: string; avatarUrl?: string; bio?: string; location?: string;
    websiteUrl?: string; facebookUrl?: string; instagramUrl?: string; githubUrl?: string;
  }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, name: true, role: true, avatarUrl: true,
        bio: true, location: true, websiteUrl: true, facebookUrl: true, instagramUrl: true, githubUrl: true,
      },
    });
  }

  async setRole(id: string, role: 'ADMIN' | 'USER') {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async setBanned(id: string, isBanned: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isBanned },
      select: { id: true, email: true, name: true, role: true, isBanned: true },
    });
  }

  async remove(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}