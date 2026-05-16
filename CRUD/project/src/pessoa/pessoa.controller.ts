import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { PessoaService } from './pessoa.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('usuarios')
export class PessoaController {
  constructor(private readonly pessoaService: PessoaService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.pessoaService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.pessoaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pessoaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.pessoaService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pessoaService.remove(id);
  }
}