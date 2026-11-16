import { Injectable } from '@nestjs/common';
import type { Aplicativo, AplicativoRepository } from '../../domain/cadastro.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PrismaAplicativoRepository implements AplicativoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listarTodos(): Promise<Aplicativo[]> {
    const linhas = await this.prisma.aplicativo.findMany({ orderBy: { codigo: 'asc' } });
    return linhas.map((a) => this.paraDominio(a));
  }

  async atualizarCusto(codigo: number, custoMensal: string): Promise<Aplicativo | null> {
    try {
      const a = await this.prisma.aplicativo.update({
        where: { codigo: BigInt(codigo) },
        data: { custoMensal },
      });
      return this.paraDominio(a);
    } catch (erro) {
      // P2025: registro nao encontrado
      if (typeof erro === 'object' && erro !== null && (erro as { code?: string }).code === 'P2025')
        return null;
      throw erro;
    }
  }

  private paraDominio(a: {
    codigo: bigint;
    nome: string;
    custoMensal: { toFixed(d: number): string };
  }): Aplicativo {
    return { codigo: Number(a.codigo), nome: a.nome, custoMensal: a.custoMensal.toFixed(2) };
  }
}
