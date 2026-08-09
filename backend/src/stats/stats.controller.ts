import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class StatsController {
    constructor(private statsService: StatsService) { }

    @Get('overview')
    overview() {
        return this.statsService.overview();
    }

    @Get('timeseries')
    timeseries(@Query('days') days?: string) {
        return this.statsService.timeseries(Number(days) || 30);
    }
}