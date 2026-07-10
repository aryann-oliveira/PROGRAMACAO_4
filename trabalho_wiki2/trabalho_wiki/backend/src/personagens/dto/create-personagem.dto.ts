import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { TimePersonagem } from '../personagem.entity';

export class CreatePersonagemDto {
  @IsString()
  @MaxLength(80)
  nome: string;

  @IsString()
  destino: string;

  @IsString()
  @MaxLength(255)
  imagem: string;

  @IsEnum(TimePersonagem)
  time: TimePersonagem;

  @IsOptional()
  @IsInt()
  ordem?: number;
}
