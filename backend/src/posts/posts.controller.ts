import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/post.dto';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) { }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findPublished(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('range') range?: string,
    @Query('authorId') authorId?: string,
  ) {
    return this.postsService.findPublished(
      Number(page) || 1,
      Number(pageSize) || 10,
      tag,
      search,
      sort === 'popular' ? 'popular' : 'newest',
      range,
      authorId,
      req.user?.userId,
      req.user?.role,
    );
  }

  @Get('popular')
  popular(@Query('limit') limit?: string, @Query('tag') tag?: string) {
    return this.postsService.findPopular(Number(limit) || 4, tag);
  }

  @Get('search-facets')
  searchFacets(@Query('search') search?: string, @Query('range') range?: string) {
    return this.postsService.searchFacets(search, range);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-quota')
  myQuota(@Req() req: any) {
    return this.postsService.getQuota(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  mine(@Req() req: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.postsService.findMine(req.user.userId, Number(page) || 1, Number(pageSize) || 10);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllForAdmin(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    return this.postsService.findAllForAdmin(Number(page) || 1, Number(pageSize) || 20, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/pending')
  findPending(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.postsService.findAllForAdmin(Number(page) || 1, Number(pageSize) || 20, 'PENDING');
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  findBySlug(@Param('slug') slug: string, @Req() req: any) {
    return this.postsService.findBySlug(slug, req.user?.userId, req.user?.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.userId, dto, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, req.user.userId, req.user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.postsService.remove(id, req.user.userId, req.user.role);
  }
}