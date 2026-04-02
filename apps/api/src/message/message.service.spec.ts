import { EntityManager } from '@mikro-orm/postgresql';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Tag } from '../tag/tag.entity';
import { TagService } from '../tag/tag.service';
import { Message } from './message.entity';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let em: ReturnType<typeof createMockEm>;
  let tagService: { findById: ReturnType<typeof vi.fn> };

  function createMockEm() {
    return {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      flush: vi.fn(),
      populate: vi.fn(),
      remove: vi.fn(),
      getReference: vi.fn(),
    };
  }

  const mockUser = { id: 'user-1', username: 'john', email: 'john@test.com' };
  const mockTag = { id: 'tag-1', name: 'General', createdAt: new Date() } as Tag;
  const mockMessage = {
    id: 'msg-1',
    content: 'Hello world',
    author: mockUser,
    tag: mockTag,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  } as unknown as Message;

  beforeEach(async () => {
    const mockEm = createMockEm();
    const module = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: EntityManager,
          useValue: mockEm,
        },
        {
          provide: TagService,
          useValue: {
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(MessageService);
    em = module.get(EntityManager);
    tagService = module.get(TagService);
  });

  describe('findAll', () => {
    it('should return paginated results with no filters', async () => {
      em.find.mockResolvedValue([mockMessage]);

      const result = await service.findAll({});

      expect(em.find).toHaveBeenCalledWith(
        Message,
        {},
        expect.objectContaining({ limit: 21, populate: ['author', 'tag'] }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should set hasMore and nextCursor when more items exist', async () => {
      const items = Array.from({ length: 21 }, (_, i) => ({
        ...mockMessage,
        id: `msg-${i}`,
        createdAt: new Date(`2026-01-${String(21 - i).padStart(2, '0')}T00:00:00Z`),
      }));
      em.find.mockResolvedValue(items as unknown as Message[]);

      const result = await service.findAll({ limit: 20 });

      expect(result.items).toHaveLength(20);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBeDefined();
    });

    it('should apply tagId filter', async () => {
      em.find.mockResolvedValue([]);

      await service.findAll({ tagId: 'tag-1' });

      expect(em.find).toHaveBeenCalledWith(
        Message,
        expect.objectContaining({ tag: 'tag-1' }),
        expect.anything(),
      );
    });

    it('should apply userId filter', async () => {
      em.find.mockResolvedValue([]);

      await service.findAll({ userId: 'user-1' });

      expect(em.find).toHaveBeenCalledWith(
        Message,
        expect.objectContaining({ author: 'user-1' }),
        expect.anything(),
      );
    });

    it('should apply date range filters', async () => {
      em.find.mockResolvedValue([]);
      const dateFrom = new Date('2026-01-01');
      const dateTo = new Date('2026-01-31');

      await service.findAll({ dateFrom, dateTo });

      expect(em.find).toHaveBeenCalledWith(
        Message,
        expect.objectContaining({
          createdAt: { $gte: dateFrom, $lte: dateTo },
        }),
        expect.anything(),
      );
    });

    it('should apply cursor for pagination', async () => {
      em.find.mockResolvedValue([]);
      const cursor = '2026-01-15T00:00:00.000Z_msg-10';

      await service.findAll({ cursor });

      expect(em.find).toHaveBeenCalledWith(
        Message,
        expect.objectContaining({ $or: expect.any(Array) as unknown }),
        expect.anything(),
      );
    });
  });

  describe('create', () => {
    it('should create a message with correct author and tag', async () => {
      tagService.findById.mockResolvedValue(mockTag);
      em.create.mockReturnValue(mockMessage);

      const result = await service.create('user-1', 'Hello world', 'tag-1');

      expect(tagService.findById).toHaveBeenCalledWith('tag-1');
      expect(em.create).toHaveBeenCalledWith(Message, {
        content: 'Hello world',
        author: 'user-1',
        tag: 'tag-1',
      });
      expect(em.flush).toHaveBeenCalled();
      expect(em.populate).toHaveBeenCalledWith(mockMessage, ['author', 'tag']);
      expect(result).toBe(mockMessage);
    });
  });

  describe('update', () => {
    it('should update content when owner', async () => {
      em.findOne.mockResolvedValue(mockMessage);

      await service.update('user-1', 'msg-1', { content: 'Updated' });

      expect(mockMessage.content).toBe('Updated');
      expect(em.flush).toHaveBeenCalled();
    });

    it('should update tag when owner', async () => {
      const newTag = { id: 'tag-2', name: 'Tech' } as Tag;
      em.findOne.mockResolvedValue({ ...mockMessage, author: mockUser });
      tagService.findById.mockResolvedValue(newTag);
      em.getReference.mockReturnValue(newTag);

      await service.update('user-1', 'msg-1', { tagId: 'tag-2' });

      expect(tagService.findById).toHaveBeenCalledWith('tag-2');
      expect(em.getReference).toHaveBeenCalledWith(Tag, 'tag-2');
      expect(em.flush).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when non-owner updates', async () => {
      em.findOne.mockResolvedValue(mockMessage);

      await expect(service.update('other-user', 'msg-1', { content: 'Hacked' })).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('should delete when owner', async () => {
      em.findOne.mockResolvedValue(mockMessage);

      await service.delete('user-1', 'msg-1');

      expect(em.remove).toHaveBeenCalledWith(mockMessage);
      expect(em.flush).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when non-owner deletes', async () => {
      em.findOne.mockResolvedValue(mockMessage);

      await expect(service.delete('other-user', 'msg-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when message does not exist', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(service.delete('user-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
