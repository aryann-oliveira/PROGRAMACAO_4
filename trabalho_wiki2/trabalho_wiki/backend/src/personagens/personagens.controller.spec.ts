import { Test, TestingModule } from '@nestjs/testing';
import { PersonagensController } from './personagens.controller';
import { PersonagensService } from './personagens.service';

describe('PersonagensController', () => {
  let controller: PersonagensController;
  let service: Partial<Record<keyof PersonagensService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonagensController],
      providers: [{ provide: PersonagensService, useValue: service }],
    }).compile();

    controller = module.get<PersonagensController>(PersonagensController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('findAll deve delegar para o service com o filtro de time', () => {
    controller.findAll('falcao');
    expect(service.findAll).toHaveBeenCalledWith('falcao');
  });

  it('findOne deve delegar para o service com o id', () => {
    controller.findOne(5);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('create deve delegar para o service com o dto', () => {
    const dto = {
      nome: 'Trent',
      destino: 'Eliminado no episódio 16',
      imagem: 'img/Trent.png',
      time: 'gafanhoto',
    } as any;
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update deve delegar para o service com id e dto', () => {
    const dto = { nome: 'Trent Atualizado' } as any;
    controller.update(5, dto);
    expect(service.update).toHaveBeenCalledWith(5, dto);
  });

  it('remove deve delegar para o service com o id', () => {
    controller.remove(5);
    expect(service.remove).toHaveBeenCalledWith(5);
  });
});
