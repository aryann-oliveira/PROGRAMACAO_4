import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Personagem } from './personagem.entity';
import { CreatePersonagemDto } from './dto/create-personagem.dto';
import { UpdatePersonagemDto } from './dto/update-personagem.dto';

@Injectable()
export class PersonagensService {
  constructor(
    @InjectRepository(Personagem)
    private readonly repo: Repository<Personagem>,
  ) {}

  // Lista todos os personagens respeitando a ordenação de apresentação.
  findAll(time?: string): Promise<Personagem[]> {
    return this.repo.find({
      where: time ? { time: time as any } : {},
      order: { ordem: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Personagem> {
    const personagem = await this.repo.findOne({ where: { id } });
    if (!personagem) {
      throw new NotFoundException(`Personagem com id ${id} não encontrado.`);
    }
    return personagem;
  }

  async create(dto: CreatePersonagemDto): Promise<Personagem> {
    // Se a ordem não for informada, empilha no final da lista.
    if (dto.ordem === undefined) {
      const total = await this.repo.count();
      dto.ordem = total;
    }
    const novo = this.repo.create(dto);
    return this.repo.save(novo);
  }

  async update(id: number, dto: UpdatePersonagemDto): Promise<Personagem> {
    const personagem = await this.findOne(id);
    Object.assign(personagem, dto);
    return this.repo.save(personagem);
  }

  async remove(id: number): Promise<void> {
    const personagem = await this.findOne(id);
    await this.repo.remove(personagem);
  }
}
