import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PersonagensService } from './personagens.service';
import { CreatePersonagemDto } from './dto/create-personagem.dto';
import { UpdatePersonagemDto } from './dto/update-personagem.dto';

// Todas as rotas de personagens exigem um usuário autenticado (Bearer JWT).
@UseGuards(JwtAuthGuard)
@Controller('personagens')
export class PersonagensController {
  constructor(private readonly personagensService: PersonagensService) {}

  // GET /api/personagens?time=falcao|gafanhoto
  @Get()
  findAll(@Query('time') time?: string) {
    return this.personagensService.findAll(time);
  }

  // GET /api/personagens/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personagensService.findOne(id);
  }

  // POST /api/personagens
  @Post()
  create(@Body() dto: CreatePersonagemDto) {
    return this.personagensService.create(dto);
  }

  // PATCH /api/personagens/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePersonagemDto,
  ) {
    return this.personagensService.update(id, dto);
  }

  // DELETE /api/personagens/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.personagensService.remove(id);
  }
}
