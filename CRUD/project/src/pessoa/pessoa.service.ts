import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class PessoaService {
  private users: User[] = [];
  private id = 1;

  create(createUserDto: CreateUserDto): User {
    const user: User = {
      id: this.id++,
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);

    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);

    if (!user) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto): User {
    const user = this.findOne(id);

    Object.assign(user, updateUserDto, {
      updatedAt: new Date(),
    });

    return user;
  }

  remove(id: number) {
    const user = this.findOne(id);

    this.users = this.users.filter((u) => u.id !== user.id);

    return {
      message: 'Usuário removido com sucesso',
    };
  }
}