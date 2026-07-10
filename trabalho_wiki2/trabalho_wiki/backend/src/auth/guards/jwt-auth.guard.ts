import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Aplicado às rotas que só podem ser acessadas após o login (JWT válido).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
