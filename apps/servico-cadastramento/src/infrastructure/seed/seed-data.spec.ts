import { describe, expect, it } from 'vitest';
import { aplicativos, clientes, montarAssinaturas, somarDias } from './seed-data.js';

const HOJE = '2026-11-16';

describe('seed-data (RNF-04)', () => {
  it.each([
    ['clientes', clientes.length, 10],
    ['aplicativos', aplicativos.length, 5],
    ['assinaturas', montarAssinaturas(HOJE).length, 5],
  ])('tem pelo menos o minimo de %s', (_nome, total, minimo) => {
    expect(total).toBeGreaterThanOrEqual(minimo);
  });

  it.each([
    ['clientes', clientes.map((c) => c.codigo)],
    ['aplicativos', aplicativos.map((a) => a.codigo)],
    ['assinaturas', montarAssinaturas(HOJE).map((s) => s.codigo)],
  ])('codigos de %s sao unicos (base da idempotencia)', (_nome, codigos) => {
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it('emails dos clientes sao unicos', () => {
    expect(new Set(clientes.map((c) => c.email)).size).toBe(clientes.length);
  });

  it.each(aplicativos)('custo de $nome e decimal em string com 2 casas', ({ custoMensal }) => {
    expect(custoMensal).toMatch(/^\d+\.\d{2}$/);
  });

  it('assinaturas referenciam clientes e aplicativos existentes', () => {
    for (const s of montarAssinaturas(HOJE)) {
      expect(clientes.some((c) => c.codigo === s.codCli)).toBe(true);
      expect(aplicativos.some((a) => a.codigo === s.codApp)).toBe(true);
    }
  });

  it('mistura assinaturas ativas e canceladas conforme RN-02 (fim > hoje)', () => {
    const ativas = montarAssinaturas(HOJE).filter((s) => s.fimVigencia > HOJE);
    expect(ativas.length).toBeGreaterThan(0);
    expect(ativas.length).toBeLessThan(montarAssinaturas(HOJE).length);
  });

  it('assinatura criada hoje tem 7 dias de vigencia (RN-01)', () => {
    const nova = montarAssinaturas(HOJE)[0];
    expect(nova.inicioVigencia).toBe(HOJE);
    expect(nova.fimVigencia).toBe('2026-11-23');
  });

  it.each([
    ['2026-11-16', 7, '2026-11-23'],
    ['2026-12-28', 7, '2027-01-04'],
    ['2028-02-27', 2, '2028-02-29'],
    ['2026-11-16', -20, '2026-10-27'],
  ])('somarDias(%s, %i) = %s', (dia, dias, esperado) => {
    expect(somarDias(dia, dias)).toBe(esperado);
  });
});
