
drop DATABASE if EXISTS nestjs ;
create database nestjs;

use nestjs;


create table pessoa (
  id int PRIMARY KEY,
  nome varchar(255),
  email varchar(255),
  senha varchar(255),
  ativo bool,
  createdAt date,
  updatedAt date); 

insert into pessoa (id, nome, email, senha, ativo, createdAt, updatedAt) values (1, 'João', 'joao@email.com', '123456', true, '2023-01-01', '2023-01-01');
insert into pessoa (id, nome, email, senha, ativo, createdAt, updatedAt) values (2, 'Maria', 'maria@email.com', '123456', true, '2023-01-01', '2023-01-01');

