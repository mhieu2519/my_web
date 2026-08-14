import { IsString, IsOptional, IsIn, MaxLength, IsArray, MinLength, IsBoolean } from 'class-validator';

export class CreatePostDto {
  @IsString() @MinLength(3) @MaxLength(200)
  title: string;

  @IsString() @MinLength(1)
  content: string;

  @IsOptional() @IsString() @MaxLength(300)
  excerpt?: string;

  @IsOptional() @IsString()
  coverImage?: string;

  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED'])
  status?: 'DRAFT' | 'PUBLISHED';

  @IsOptional() @IsArray()
  tags?: string[];

  @IsOptional() @IsString() @MaxLength(200)
  slug?: string;

  @IsOptional() @IsBoolean()
  isFeatured?: boolean;

  @IsOptional() @IsBoolean()
  commentsEnabled?: boolean;
}

export class UpdatePostDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(200)
  title?: string;

  @IsOptional() @IsString() @MinLength(1)
  content?: string;

  @IsOptional() @IsString() @MaxLength(300)
  excerpt?: string;

  @IsOptional() @IsString()
  coverImage?: string;

  @IsOptional() @IsIn(['DRAFT', 'PUBLISHED'])
  status?: 'DRAFT' | 'PUBLISHED';

  @IsOptional() @IsArray()
  tags?: string[];

  @IsOptional() @IsString() @MaxLength(200)
  slug?: string;

  @IsOptional() @IsBoolean()
  isFeatured?: boolean;

  @IsOptional() @IsBoolean()
  commentsEnabled?: boolean;
}