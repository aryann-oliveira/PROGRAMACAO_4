/**
 * Script de seed: popula o banco de dados MySQL com os personagens que
 * antes estavam "mockados" (hardcoded) no index.html, além de um usuário
 * administrador padrão para testar o login.
 *
 * Uso: npm run seed
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Personagem, TimePersonagem } from '../personagens/personagem.entity';
import { User } from '../users/user.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'drama_total_wiki',
  entities: [Personagem, User],
  synchronize: true,
});

const personagens: Array<Omit<Personagem, 'id' | 'createdAt' | 'updatedAt'>> = [
  { nome: 'Gwen', destino: 'Finalista — chegou ao final da temporada.', imagem: 'img/Gwen.png', time: TimePersonagem.GAFANHOTO, ordem: 1 } as any,
  { nome: 'Owen', destino: 'Vencedor da 1ª temporada (versão original).', imagem: 'img/Owen.png', time: TimePersonagem.GAFANHOTO, ordem: 2 } as any,
  { nome: 'Heather', destino: 'Eliminada no episódio 25 — A Grande Final.', imagem: 'img/Heather.png', time: TimePersonagem.GAFANHOTO, ordem: 3 } as any,
  { nome: 'Duncan', destino: 'Eliminado no episódio 24.', imagem: 'img/Duncan.png', time: TimePersonagem.FALCAO, ordem: 4 } as any,
  { nome: 'LeShawna', destino: 'Eliminada no episódio 23.', imagem: 'img/LeShawna.png', time: TimePersonagem.GAFANHOTO, ordem: 5 } as any,
  { nome: 'Geoff', destino: 'Eliminado no episódio 22.', imagem: 'img/Geoff.png', time: TimePersonagem.FALCAO, ordem: 6 } as any,
  { nome: 'Bridgette', destino: 'Eliminada no episódio 20.', imagem: 'img/Bridgette.png', time: TimePersonagem.FALCAO, ordem: 7 } as any,
  { nome: 'DJ', destino: 'Eliminado no episódio 19.', imagem: 'img/DJ.png', time: TimePersonagem.FALCAO, ordem: 8 } as any,
  { nome: 'Izzy', destino: 'Eliminada nos episódios 9 e 17 (voltou uma vez).', imagem: 'img/Izzy.png', time: TimePersonagem.GAFANHOTO, ordem: 9 } as any,
  { nome: 'Lindsay', destino: 'Eliminada no episódio 17.', imagem: 'img/Lindsay.png', time: TimePersonagem.GAFANHOTO, ordem: 10 } as any,
  { nome: 'Trent', destino: 'Eliminado no episódio 16.', imagem: 'img/Trent.png', time: TimePersonagem.GAFANHOTO, ordem: 11 } as any,
  { nome: 'Harold', destino: 'Eliminado no episódio 15.', imagem: 'img/Harold.png', time: TimePersonagem.GAFANHOTO, ordem: 12 } as any,
  { nome: 'Courtney', destino: 'Eliminada no episódio 14.', imagem: 'img/Courtney.png', time: TimePersonagem.FALCAO, ordem: 13 } as any,
  { nome: 'Sadie', destino: 'Eliminada no episódio 13.', imagem: 'img/Sadie.png', time: TimePersonagem.FALCAO, ordem: 14 } as any,
  { nome: 'Tyler', destino: 'Eliminado no episódio 12.', imagem: 'img/Tyler.png', time: TimePersonagem.FALCAO, ordem: 15 } as any,
  { nome: 'Cody', destino: 'Eliminado no episódio 10.', imagem: 'img/Cody.png', time: TimePersonagem.GAFANHOTO, ordem: 16 } as any,
  { nome: 'Beth', destino: 'Eliminada no episódio 8.', imagem: 'img/Beth.png', time: TimePersonagem.FALCAO, ordem: 17 } as any,
  { nome: 'Katie', destino: 'Eliminada no episódio 7.', imagem: 'img/Katie.png', time: TimePersonagem.FALCAO, ordem: 18 } as any,
  { nome: 'Noah', destino: 'Eliminado no episódio 6.', imagem: 'img/Noah.png', time: TimePersonagem.GAFANHOTO, ordem: 19 } as any,
  { nome: 'Eva', destino: 'Eliminada nos episódios 5 e 18 (voltou uma vez).', imagem: 'img/Eva.png', time: TimePersonagem.FALCAO, ordem: 20 } as any,
  { nome: 'Justin', destino: 'Eliminado no episódio 4.', imagem: 'img/Justin.png', time: TimePersonagem.GAFANHOTO, ordem: 21 } as any,
  { nome: 'Ezekiel', destino: '1º eliminado — episódio 2.', imagem: 'img/Ezekiel.png', time: TimePersonagem.FALCAO, ordem: 22 } as any,
];

async function seed() {
  await dataSource.initialize();
  console.log('Conectado ao banco. Iniciando seed...');

  const personagemRepo = dataSource.getRepository(Personagem);
  const userRepo = dataSource.getRepository(User);

  const totalPersonagens = await personagemRepo.count();
  if (totalPersonagens === 0) {
    await personagemRepo.save(personagemRepo.create(personagens));
    console.log(`✔ ${personagens.length} personagens inseridos.`);
  } else {
    console.log('… Tabela de personagens já possui dados, seed de personagens ignorado.');
  }

  const admin = await userRepo.findOne({ where: { username: 'admin' } });
  if (!admin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await userRepo.save(userRepo.create({ username: 'admin', passwordHash }));
    console.log('✔ Usuário admin criado (usuário: admin / senha: admin123).');
  } else {
    console.log('… Usuário admin já existe, seed de usuário ignorado.');
  }

  await dataSource.destroy();
  console.log('Seed finalizado.');
}

seed().catch((err) => {
  console.error('Erro ao executar seed:', err);
  process.exit(1);
});
