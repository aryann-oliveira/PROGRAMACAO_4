import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(() => {
    usersService = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('token-fake'),
    };

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  describe('register', () => {
    it('deve criar um usuário novo e retornar um token', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      usersService.create.mockResolvedValue({
        id: 1,
        username: 'ryan',
        passwordHash: 'hash',
      });

      const result = await authService.register('ryan', 'senha123');

      expect(usersService.findByUsername).toHaveBeenCalledWith('ryan');
      expect(usersService.create).toHaveBeenCalled();
      expect(result.access_token).toBe('token-fake');
      expect(result.user).toEqual({ id: 1, username: 'ryan' });
    });

    it('deve lançar ConflictException se o usuário já existir', async () => {
      usersService.findByUsername.mockResolvedValue({ id: 1, username: 'ryan' });

      await expect(authService.register('ryan', 'senha123')).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve autenticar com credenciais válidas', async () => {
      const passwordHash = await bcrypt.hash('senha123', 10);
      usersService.findByUsername.mockResolvedValue({
        id: 2,
        username: 'chris',
        passwordHash,
      });

      const result = await authService.login('chris', 'senha123');

      expect(result.access_token).toBe('token-fake');
      expect(result.user).toEqual({ id: 2, username: 'chris' });
    });

    it('deve lançar UnauthorizedException se o usuário não existir', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      await expect(authService.login('desconhecido', 'x')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException se a senha estiver incorreta', async () => {
      const passwordHash = await bcrypt.hash('senha-correta', 10);
      usersService.findByUsername.mockResolvedValue({
        id: 3,
        username: 'chef',
        passwordHash,
      });

      await expect(
        authService.login('chef', 'senha-errada'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
