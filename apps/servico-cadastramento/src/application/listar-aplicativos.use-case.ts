import type { Aplicativo, AplicativoRepository } from '../domain/cadastro.js';

export class ListarAplicativosUseCase {
  constructor(private readonly aplicativos: AplicativoRepository) {}

  executar(): Promise<Aplicativo[]> {
    return this.aplicativos.listarTodos();
  }
}
