import { Controller, Post, Get, Param, UseGuards, Req, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookmarksService } from './bookmarks.service';

@Controller('bookmarks')
export class BookmarksController {
    constructor(private bookmarksService: BookmarksService) { }

    @UseGuards(JwtAuthGuard)
    @Throttle({ default: { limit: 30, ttl: 60000 } })
    @Post(':postId/toggle')
    toggle(@Req() req: any, @Param('postId') postId: string) {
        return this.bookmarksService.toggle(req.user.userId, postId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('mine/ids')
    myIds(@Req() req: any) {
        return this.bookmarksService.myBookmarkedPostIds(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('mine')
    mine(@Req() req: any, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
        return this.bookmarksService.myBookmarks(req.user.userId, Number(page) || 1, Number(pageSize) || 10);
    }
}