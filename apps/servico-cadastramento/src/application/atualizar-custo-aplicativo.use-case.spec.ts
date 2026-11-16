import { describe, expect, it } from 'vitest';
import { AplicativoNaoEncontradoError } from '../domain/cadastro.js';
import type { AplicativoRepository } from '../domain/cadastro.js';
import { AtualizarCustoAplicativoUseCase } from './atualizar-custo-aplicativo.use-case.js';

const repo: AplicativoRepository = {
  listarTodos: async () => [],
  atualizarCusto: async (codigo, custoMensal) =>
    codigo === 1 ? { codigo, nome: 'Agenda', custoMensal } : null,
};

describe('AtualizarCustoAplicativoUseCase', () => {
  it('devolve o aplicativo com o novo custo', async () => {
    expect(await new AtualizarCustoAplicativoUseCase(repo).executar(1, '24.90')).toEqual({
      codigo: 1,
      nome: 'Agenda',
      custoMensal: '24.90',
    });
  });

  it('lanca AplicativoNaoEncontradoError quando nao existe', async () => {
    await expect(
      new AtualizarCustoAplicativoUseCase(repo).executar(99, '10.00'),
    ).rejects.toBeInstanceOf(AplicativoNaoEncontradoError);
  });
});
