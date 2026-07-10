import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Personagem } from './personagem.entity';
import { PersonagensService } from './personagens.service';
import { PersonagensController } from './personagens.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Personagem]), AuthModule],
  controllers: [PersonagensController],
  providers: [PersonagensService],
  exports: [PersonagensService],
})
export class PersonagensModule {}
