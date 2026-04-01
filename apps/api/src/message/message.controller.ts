import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageFilterDto } from './dto/message-filter.dto';
import {
  MessageResponseDto,
  PaginatedMessagesResponseDto,
} from './dto/message-response.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated list of messages', type: PaginatedMessagesResponseDto })
  async findAll(@Query() filters: MessageFilterDto) {
    return this.messageService.findAll(filters);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Message created', type: MessageResponseDto })
  async create(@Req() req: Request, @Body() dto: CreateMessageDto) {
    const user = req.user as JwtPayload;
    return this.messageService.create(user.sub, dto.content, dto.tagId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Message updated', type: MessageResponseDto })
  async update(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    const user = req.user as JwtPayload;
    return this.messageService.update(user.sub, id, {
      content: dto.content,
      tagId: dto.tagId,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Message deleted' })
  async delete(@Req() req: Request, @Param('id', ParseUUIDPipe) id: string) {
    const user = req.user as JwtPayload;
    await this.messageService.delete(user.sub, id);
  }
}
