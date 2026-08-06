import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  postId: string;

  @IsString() @MinLength(1) @MaxLength(2000)
  content: string;

  @IsOptional() @IsString()
  parentId?: string;
}

export class UpdateCommentDto {
  @IsString() @MinLength(1) @MaxLength(2000)
  content: string;
}
