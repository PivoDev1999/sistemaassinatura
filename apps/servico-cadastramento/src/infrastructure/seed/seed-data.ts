// Dados do seed (RNF-04). Funcoes puras: sem banco, sem relogio global, para poder testar.
// Codigos fixos permitem repetir o seed sem duplicar (upsert, ADR 0014).

export interface ClienteSeed {
  codigo: number;
  nome: string;
  email: string;
}
export interface AplicativoSeed {
  codigo: number;
  nome: string;
  custoMensal: string; // string decimal ("29.90"), nunca number em dinheiro (ADR 0006)
}
export interface AssinaturaSeed {
  codigo: number;
  codCli: number;
  codApp: number;
  inicioVigencia: string; // dia de calendario "AAAA-MM-DD" (ADR 0005)
  fimVigencia: string;
}

export const clientes: ClienteSeed[] = [
  { codigo: 1, nome: 'Ana Souza', email: 'ana.souza@exemplo.com' },
  { codigo: 2, nome: 'Bruno Lima', email: 'bruno.lima@exemplo.com' },
  { codigo: 3, nome: 'Carla Mendes', email: 'carla.mendes@exemplo.com' },
  { codigo: 4, nome: 'Diego Alves', email: 'diego.alves@exemplo.com' },
  { codigo: 5, nome: 'Elisa Rocha', email: 'elisa.rocha@exemplo.com' },
  { codigo: 6, nome: 'Fabio Costa', email: 'fabio.costa@exemplo.com' },
  { codigo: 7, nome: 'Gabriela Dias', email: 'gabriela.dias@exemplo.com' },
  { codigo: 8, nome: 'Henrique Prado', email: 'henrique.prado@exemplo.com' },
  { codigo: 9, nome: 'Isabela Nunes', email: 'isabela.nunes@exemplo.com' },
  { codigo: 10, nome: 'Joao Teixeira', email: 'joao.teixeira@exemplo.com' },
];

export const aplicativos: AplicativoSeed[] = [
  { codigo: 1, nome: 'Agenda Fácil', custoMensal: '19.90' },
  { codigo: 2, nome: 'Finanças Pessoais', custoMensal: '29.90' },
  { codigo: 3, nome: 'Treino em Casa', custoMensal: '24.90' },
  { codigo: 4, nome: 'Notas Rápidas', custoMensal: '9.90' },
  { codigo: 5, nome: 'Estudo Guiado', custoMensal: '39.90' },
];

export function somarDias(dia: string, dias: number): string {
  const data = new Date(`${dia}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

// `hoje` vem de fora ("AAAA-MM-DD" no fuso America/Sao_Paulo), nunca de new Date() aqui.
// Mistura ATIVAS (fim > hoje) e CANCELADAS (fim <= hoje) para exercitar RN-02.
export function montarAssinaturas(hoje: string): AssinaturaSeed[] {
  const periodo = (codigo: number, codCli: number, codApp: number, inicioEmDias: number, fimEmDias: number) => ({
    codigo,
    codCli,
    codApp,
    inicioVigencia: somarDias(hoje, inicioEmDias),
    fimVigencia: somarDias(hoje, fimEmDias),
  });
  return [
    periodo(1, 1, 1, 0, 7), // criada hoje: 7 dias gratis (RN-01)
    periodo(2, 2, 2, -20, 10), // ativa
    periodo(3, 3, 3, -3, 4), // ativa, perto de vencer
    periodo(4, 4, 4, -40, -10), // cancelada (vencida)
    periodo(5, 5, 5, -30, 0), // cancelada: fim == hoje nao e ativa
    periodo(6, 1, 2, -5, 25), // mesmo cliente, outro app
  ];
}
