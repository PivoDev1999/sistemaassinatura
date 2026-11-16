// Entidades e portas de leitura do cadastro. TypeScript puro (sem Nest, sem Prisma).

export interface Cliente {
  codigo: number;
  nome: string;
  email: string;
}

export interface Aplicativo {
  codigo: number;
  nome: string;
  custoMensal: string; // decimal exato em texto ("29.90"), ADR 0006
}

export interface ClienteRepository {
  listarTodos(): Promise<Cliente[]>;
}

export interface AplicativoRepository {
  listarTodos(): Promise<Aplicativo[]>;
  // Devolve null quando o aplicativo nao existe.
  atualizarCusto(codigo: number, custoMensal: string): Promise<Aplicativo | null>;
}

export class AplicativoNaoEncontradoError extends Error {
  constructor(codigo: number) {
    super(`Aplicativo ${codigo} nao encontrado`);
  }
}
