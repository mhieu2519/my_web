import { Controller, Get, Patch, Post, Delete, Param, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';
import { IsOptional, IsString, MaxLength, IsIn, IsInt, Min, Max } from 'class-validator';
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

class SetPostLimitDto {
  @IsInt() @Min(0) @Max(1000)
  monthlyPostLimit!: number;
}

class ReassignIdDto {
  @IsInt() @Min(0)
  newId!: number;
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

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/public')
  publicProfile(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.usersService.findPublicProfile(id, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/follow/toggle')
  toggleFollow(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleFollow(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/role')
  setRole(@Param('id', ParseIntPipe) id: number, @Body() dto: SetRoleDto) {
    return this.usersService.setRole(id, dto.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/ban')
  setBanned(@Param('id', ParseIntPipe) id: number, @Body() dto: SetBannedDto) {
    return this.usersService.setBanned(id, dto.isBanned);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/post-limit')
  setPostLimit(@Param('id', ParseIntPipe) id: number, @Body() dto: SetPostLimitDto) {
    return this.usersService.setMonthlyPostLimit(id, dto.monthlyPostLimit);
  }

  // Gán lại 1 id còn trống cho tài khoản này
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/reassign-id')
  reassignId(@Param('id', ParseIntPipe) id: number, @Body() dto: ReassignIdDto) {
    return this.usersService.reassignId(id, dto.newId);
  }
}