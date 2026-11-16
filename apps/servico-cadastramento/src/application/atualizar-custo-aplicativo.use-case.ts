import { AplicativoNaoEncontradoError } from '../domain/cadastro.js';
import type { Aplicativo, AplicativoRepository } from '../domain/cadastro.js';

export class AtualizarCustoAplicativoUseCase {
  constructor(private readonly aplicativos: AplicativoRepository) {}

  async executar(codigo: number, custoMensal: string): Promise<Aplicativo> {
    const atualizado = await this.aplicativos.atualizarCusto(codigo, custoMensal);
    if (!atualizado) throw new AplicativoNaoEncontradoError(codigo);
    return atualizado;
  }
}
