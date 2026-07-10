import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonagensService } from './personagens.service';
import { Personagem, TimePersonagem } from './personagem.entity';

type MockRepo = Partial<Record<keyof Repository<Personagem>, jest.Mock>>;

const createMockRepo = (): MockRepo => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
});

describe('PersonagensService', () => {
  let service: PersonagensService;
  let repo: MockRepo;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonagensService,
        {
          provide: getRepositoryToken(Personagem),
          useValue: createMockRepo(),
        },
      ],
    }).compile();

    service = module.get<PersonagensService>(PersonagensService);
    repo = module.get(getRepositoryToken(Personagem));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar a lista ordenada pelo campo ordem', async () => {
      const lista = [{ id: 1, nome: 'Gwen', ordem: 0 }];
      repo.find!.mockResolvedValue(lista);

      const resultado = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        where: {},
        order: { ordem: 'ASC', id: 'ASC' },
      });
      expect(resultado).toEqual(lista);
    });

    it('deve filtrar por time quando informado', async () => {
      repo.find!.mockResolvedValue([]);

      await service.findAll('falcao');

      expect(repo.find).toHaveBeenCalledWith({
        where: { time: 'falcao' },
        order: { ordem: 'ASC', id: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar o personagem quando encontrado', async () => {
      const personagem = { id: 1, nome: 'Owen' };
      repo.findOne!.mockResolvedValue(personagem);

      const resultado = await service.findOne(1);

      expect(resultado).toEqual(personagem);
    });

    it('deve lançar NotFoundException quando não encontrado', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('deve calcular a ordem automaticamente quando não informada', async () => {
      repo.count!.mockResolvedValue(3);
      const dto: { nome: string; destino: string; imagem: string; time: TimePersonagem; ordem?: number } = {
        nome: 'Izzy',
        destino: 'Eliminada no episódio 9',
        imagem: 'img/Izzy.png',
        time: TimePersonagem.GAFANHOTO,
      };
      repo.create!.mockImplementation((data) => data);
      repo.save!.mockImplementation((data) => Promise.resolve({ id: 10, ...data }));

      const resultado = await service.create(dto as any);

      expect(dto.ordem).toBe(3);
      expect(resultado.id).toBe(10);
    });
  });

  describe('update', () => {
    it('deve mesclar os dados e salvar', async () => {
      const existente = { id: 1, nome: 'Owen', ordem: 0 };
      repo.findOne!.mockResolvedValue(existente);
      repo.save!.mockImplementation((data) => Promise.resolve(data));

      const resultado = await service.update(1, { nome: 'Owen Atualizado' } as any);

      expect(resultado.nome).toBe('Owen Atualizado');
    });
  });

  describe('remove', () => {
    it('deve remover o personagem existente', async () => {
      const existente = { id: 1, nome: 'Owen' };
      repo.findOne!.mockResolvedValue(existente);
      repo.remove!.mockResolvedValue(undefined);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(existente);
    });
  });
});
