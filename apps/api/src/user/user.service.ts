import { EntityManager, FilterQuery, QueryOrder } from '@mikro-orm/postgresql';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async search(query?: string, limit = 10): Promise<User[]> {
    const where: FilterQuery<User> = query ? { username: { $ilike: `%${query}%` } } : {};
    return this.em.find(User, where, {
      orderBy: { username: QueryOrder.ASC },
      limit,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  async findById(id: string): Promise<User> {
    const user = await this.em.findOne(User, { id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(username: string, email: string, password: string): Promise<User> {
    const existing = await this.em.findOne(User, {
      $or: [{ email }, { username }],
    });
    if (existing) {
      throw new ConflictException('Username or email already taken');
    }

    const passwordHash = await argon2.hash(password);
    const user = this.em.create(User, { username, email, passwordHash });
    await this.em.flush();
    return user;
  }
}
