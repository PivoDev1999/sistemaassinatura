import { describe, expect, it } from 'vitest';
import type { Aplicativo, Cliente } from '../domain/cadastro.js';
import { ListarAplicativosUseCase } from './listar-aplicativos.use-case.js';
import { ListarClientesUseCase } from './listar-clientes.use-case.js';

const clientes: Cliente[] = [{ codigo: 1, nome: 'Ana', email: 'ana@exemplo.com' }];
const aplicativos: Aplicativo[] = [{ codigo: 1, nome: 'Agenda', custoMensal: '19.90' }];

describe('casos de uso de listagem', () => {
  it.each([
    ['ListarClientes', new ListarClientesUseCase({ listarTodos: async () => clientes }), clientes],
    [
      'ListarAplicativos',
      new ListarAplicativosUseCase({
        listarTodos: async () => aplicativos,
        atualizarCusto: async () => null,
      }),
      aplicativos,
    ],
    ['ListarClientes (vazio)', new ListarClientesUseCase({ listarTodos: async () => [] }), []],
  ])('%s devolve o que o repositorio tem', async (_nome, useCase, esperado) => {
    expect(await useCase.executar()).toEqual(esperado);
  });
});
