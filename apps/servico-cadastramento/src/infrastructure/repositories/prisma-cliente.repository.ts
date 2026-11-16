import { Injectable } from '@nestjs/common';
import type { Cliente, ClienteRepository } from '../../domain/cadastro.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PrismaClienteRepository implements ClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarTodos(): Promise<Cliente[]> {
    const linhas = await this.prisma.cliente.findMany({ orderBy: { codigo: 'asc' } });
    // BigInt -> number: os codigos cabem com folga em number (ADR 0016).
    return linhas.map((c) => ({ codigo: Number(c.codigo), nome: c.nome, email: c.email }));
  }
}
