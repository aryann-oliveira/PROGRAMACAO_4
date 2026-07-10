import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TimePersonagem {
  FALCAO = 'falcao',
  GAFANHOTO = 'gafanhoto',
}

@Entity('personagens')
export class Personagem {
  @PrimaryGeneratedColumn()
  id: number;

  // Título: nome do personagem
  @Column({ length: 80 })
  nome: string;

  // Conteúdo/Texto: descrição do destino/spoiler do personagem
  @Column({ type: 'text' })
  destino: string;

  // Imagem: caminho/URL da imagem associada ao personagem
  @Column({ length: 255 })
  imagem: string;

  @Column({ type: 'enum', enum: TimePersonagem })
  time: TimePersonagem;

  // Ordenação de Apresentação: define a ordem de exibição no front-end
  @Column({ name: 'ordem', type: 'int', default: 0 })
  ordem: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
