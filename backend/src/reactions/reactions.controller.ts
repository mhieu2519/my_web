import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReactionsService } from './reactions.service';
import { ToggleReactionDto } from './dto/reaction.dto';

@Controller('reactions')
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Get()
  summary(@Query('postId') postId: string) {
    return this.reactionsService.summary(postId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('toggle')
  toggle(@Req() req: any, @Body() dto: ToggleReactionDto) {
    return this.reactionsService.toggle(req.user.userId, dto);
  }
}
