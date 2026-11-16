import { Injectable } from '@nestjs/common';
import type { Aplicativo, AplicativoRepository } from '../../domain/cadastro.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PrismaAplicativoRepository implements AplicativoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarTodos(): Promise<Aplicativo[]> {
    const linhas = await this.prisma.aplicativo.findMany({ orderBy: { codigo: 'asc' } });
    return linhas.map((a) => ({
      codigo: Number(a.codigo),
      nome: a.nome,
      custoMensal: a.custoMensal.toFixed(2),
    }));
  }
}
