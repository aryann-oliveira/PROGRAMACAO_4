import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    const existente = await this.usersService.findByUsername(username);
    if (existente) {
      throw new ConflictException('Nome de usuário já está em uso.');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.usersService.create(username, passwordHash);

    return this.buildToken(user.id, user.username);
  }

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const senhaValida = await bcrypt.compare(password, user.passwordHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.buildToken(user.id, user.username);
  }

  private buildToken(sub: number, username: string) {
    const payload = { sub, username };
    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      user: { id: sub, username },
    };
  }
}
