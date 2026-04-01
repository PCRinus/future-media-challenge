import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

vi.mock('argon2', () => ({
  verify: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: { findByEmail: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  const mockUser = {
    id: 'user-1',
    username: 'john',
    email: 'john@test.com',
    passwordHash: 'hashed-password',
  } as unknown as User;

  beforeEach(async () => {
    vi.restoreAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: vi.fn(),
            create: vi.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should create a user and return a JWT', async () => {
      userService.create.mockResolvedValue(mockUser);

      const result = await service.register('john', 'john@test.com', 'password123');

      expect(userService.create).toHaveBeenCalledWith('john', 'john@test.com', 'password123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'john@test.com',
      });
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
    });
  });

  describe('login', () => {
    it('should return a JWT with valid credentials', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(argon2.verify).mockResolvedValue(true);

      const result = await service.login('john@test.com', 'password123');

      expect(userService.findByEmail).toHaveBeenCalledWith('john@test.com');
      expect(argon2.verify).toHaveBeenCalledWith('hashed-password', 'password123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'john@test.com',
      });
      expect(result).toEqual({ accessToken: 'mock-jwt-token' });
    });

    it('should throw UnauthorizedException when email not found', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(service.login('unknown@test.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      userService.findByEmail.mockResolvedValue(mockUser);
      vi.mocked(argon2.verify).mockResolvedValue(false);

      await expect(service.login('john@test.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
