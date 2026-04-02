import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { SearchUsersQueryDto } from './dto/search-users-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserSearchResultDto } from './dto/user-search-result.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search users by username' })
  @ApiOkResponse({ description: 'List of matching users', type: [UserSearchResultDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async search(@Query() query: SearchUsersQueryDto) {
    return await this.userService.search(query.q, query.limit);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({ description: 'Current user profile', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Req() req: Request) {
    const payload = req.user as JwtPayload;
    return this.userService.findById(payload.sub);
  }
}
