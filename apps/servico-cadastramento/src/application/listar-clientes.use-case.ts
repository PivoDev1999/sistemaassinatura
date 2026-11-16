import type { Cliente, ClienteRepository } from '../domain/cadastro.js';

export class ListarClientesUseCase {
  constructor(private readonly clientes: ClienteRepository) {}

  executar(): Promise<Cliente[]> {
    return this.clientes.listarTodos();
  }
}
