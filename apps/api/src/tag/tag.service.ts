import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<Tag[]> {
    return this.em.findAll(Tag, { orderBy: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Tag> {
    const tag = await this.em.findOne(Tag, { id });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async create(name: string): Promise<Tag> {
    const existing = await this.em.findOne(Tag, { name });
    if (existing) {
      throw new ConflictException('Tag already exists');
    }

    const tag = this.em.create(Tag, { name });
    await this.em.flush();
    return tag;
  }
}
