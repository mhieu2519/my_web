import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { IsOptional, IsString, MaxLength, IsIn } from 'class-validator';

class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50) name?: string;
  @IsOptional() @IsString() avatarUrl?: string;
  @IsOptional() @IsString() @MaxLength(300) bio?: string;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsString() @MaxLength(200) websiteUrl?: string;
  @IsOptional() @IsString() @MaxLength(200) facebookUrl?: string;
  @IsOptional() @IsString() @MaxLength(200) instagramUrl?: string;
  @IsOptional() @IsString() @MaxLength(200) githubUrl?: string;
}

class SetRoleDto {
  @IsIn(['ADMIN', 'USER'])
  role!: 'ADMIN' | 'USER';
}

class SetBannedDto {
  @IsIn([true, false])
  isBanned!: boolean;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, dto);
  }

  // Công khai: xem hồ sơ tác giả — nếu đã đăng nhập thì kèm luôn trạng thái đang theo dõi hay chưa
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/public')
  publicProfile(@Param('id') id: string, @Req() req: any) {
    return this.usersService.findPublicProfile(id, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow/toggle')
  toggleFollow(@Req() req: any, @Param('id') id: string) {
    return this.usersService.toggleFollow(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/role')
  setRole(@Param('id') id: string, @Body() dto: SetRoleDto) {
    return this.usersService.setRole(id, dto.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/ban')
  setBanned(@Param('id') id: string, @Body() dto: SetBannedDto) {
    return this.usersService.setBanned(id, dto.isBanned);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}