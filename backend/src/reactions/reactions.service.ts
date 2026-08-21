import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ToggleReactionDto } from './dto/reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(private prisma: PrismaService) { }

  async summary(postId: string, userId?: number) {
    const reactions = await this.prisma.reaction.findMany({ where: { postId } });
    const counts: Record<string, number> = {};
    for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + 1;

    const mine = userId ? reactions.find((r) => r.userId === userId)?.type ?? null : null;
    return { counts, total: reactions.length, myReaction: mine };
  }

  // Bấm lại cùng loại icon -> gỡ; bấm loại khác -> đổi loại; chưa có -> tạo mới
  async toggle(userId: number, dto: ToggleReactionDto) {
    const existing = await this.prisma.reaction.findUnique({
      where: { postId_userId: { postId: dto.postId, userId } },
    });

    if (existing && existing.type === dto.type) {
      await this.prisma.reaction.delete({ where: { id: existing.id } });
    } else if (existing) {
      await this.prisma.reaction.update({ where: { id: existing.id }, data: { type: dto.type } });
    } else {
      await this.prisma.reaction.create({
        data: { postId: dto.postId, userId, type: dto.type },
      });
    }

    return this.summary(dto.postId, userId);
  }
}
