import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.tag.findMany({
            include: { _count: { select: { posts: true } } },
            orderBy: { name: 'asc' },
        });
    }

    async rename(id: string, name: string) {
        const tag = await this.prisma.tag.findUnique({ where: { id } });
        if (!tag) throw new NotFoundException('Không tìm thấy thẻ');

        const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
        const clash = await this.prisma.tag.findFirst({ where: { slug, NOT: { id } } });
        if (clash) throw new ConflictException('Tên thẻ đã tồn tại');

        return this.prisma.tag.update({ where: { id }, data: { name, slug } });
    }

    async remove(id: string) {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
            include: { _count: { select: { posts: true } } },
        });
        if (!tag) throw new NotFoundException('Không tìm thấy thẻ');
        if (tag._count.posts > 0) {
            throw new BadRequestException('Thẻ đang được dùng ở bài viết, không thể xoá');
        }
        await this.prisma.tag.delete({ where: { id } });
        return { success: true };
    }
}