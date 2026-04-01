import { EntityManager, FilterQuery, QueryOrder } from '@mikro-orm/postgresql';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { Tag } from '../tag/tag.entity';
import { TagService } from '../tag/tag.service';
import { MessageFilterDto } from './dto/message-filter.dto';
import { PaginatedMessagesDto } from './dto/paginated-messages.dto';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    private readonly em: EntityManager,
    private readonly tagService: TagService,
  ) {}

  async findAll(filters: MessageFilterDto): Promise<PaginatedMessagesDto<Message>> {
    const limit = filters.limit ?? 20;
    const where: FilterQuery<Message> = {};

    if (filters.tagId) {
      where.tag = filters.tagId;
    }

    if (filters.userId) {
      where.author = filters.userId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.$lte = filters.dateTo;
      }
    }

    if (filters.cursor) {
      const [cursorDate, cursorId] = this.decodeCursor(filters.cursor);
      where.$or = [
        { createdAt: { $lt: cursorDate } },
        { createdAt: cursorDate, id: { $lt: cursorId } },
      ];
    }

    const items = await this.em.find(Message, where, {
      orderBy: { createdAt: QueryOrder.DESC, id: QueryOrder.DESC },
      limit: limit + 1,
      populate: ['author', 'tag'],
    });

    const hasMore = items.length > limit;
    if (hasMore) {
      items.pop();
    }

    const nextCursor =
      hasMore && items.length > 0 ? this.encodeCursor(items[items.length - 1]) : null;

    return { items, nextCursor, hasMore };
  }

  async create(userId: string, content: string, tagId: string): Promise<Message> {
    const tag = await this.tagService.findById(tagId);
    const message = this.em.create(Message, {
      content,
      author: userId,
      tag: tag.id,
    });
    await this.em.flush();
    await this.em.populate(message, ['author', 'tag']);
    return message;
  }

  async update(
    userId: string,
    messageId: string,
    data: { content?: string; tagId?: string },
  ): Promise<Message> {
    const message = await this.findOneOrFail(messageId);
    this.assertOwnership(message, userId);

    if (data.content !== undefined) {
      message.content = data.content;
    }

    if (data.tagId !== undefined) {
      const tag = await this.tagService.findById(data.tagId);
      message.tag = this.em.getReference(Tag, tag.id);
    }

    await this.em.flush();
    await this.em.populate(message, ['author', 'tag']);
    return message;
  }

  async delete(userId: string, messageId: string): Promise<void> {
    const message = await this.findOneOrFail(messageId);
    this.assertOwnership(message, userId);
    this.em.remove(message);
    await this.em.flush();
  }

  private async findOneOrFail(id: string): Promise<Message> {
    const message = await this.em.findOne(Message, { id }, { populate: ['author', 'tag'] });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  private assertOwnership(message: Message, userId: string): void {
    if (message.author.id !== userId) {
      throw new ForbiddenException('You can only modify your own messages');
    }
  }

  private encodeCursor(message: Message): string {
    return `${message.createdAt.toISOString()}_${message.id}`;
  }

  private decodeCursor(cursor: string): [Date, string] {
    const separatorIdx = cursor.lastIndexOf('_');
    if (separatorIdx === -1) {
      throw new NotFoundException('Invalid cursor');
    }
    const date = new Date(cursor.substring(0, separatorIdx));
    const id = cursor.substring(separatorIdx + 1);
    return [date, id];
  }
}
