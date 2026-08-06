import { IsString, IsIn } from 'class-validator';

const TYPES = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'] as const;

export class ToggleReactionDto {
  @IsString()
  postId: string;

  @IsIn(TYPES)
  type: (typeof TYPES)[number];
}
