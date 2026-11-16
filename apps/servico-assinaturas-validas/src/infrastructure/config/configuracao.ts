export interface Configuracao {
  porta: number;
}

export const VARIAVEL_PORTA = 'ASSINATURAS_VALIDAS_PORT';

export function lerConfiguracao(env: Record<string, unknown>): Configuracao {
  const bruto = env[VARIAVEL_PORTA];
  if (bruto === undefined || bruto === null || String(bruto).trim() === '') {
    throw new Error(
      `Configuracao invalida: a variavel ${VARIAVEL_PORTA} e obrigatoria (ex.: veja .env.example).`,
    );
  }
  const porta = Number(bruto);
  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error(
      `Configuracao invalida: ${VARIAVEL_PORTA} deve ser uma porta entre 1 e 65535, recebido "${String(bruto)}".`,
    );
  }
  return { porta };
}

export function validarConfiguracao(env: Record<string, unknown>): Record<string, unknown> {
  lerConfiguracao(env);
  return env;
}

export const configuracao = (): Configuracao => lerConfiguracao(process.env);
