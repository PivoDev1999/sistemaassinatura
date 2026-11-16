import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configurarApp } from '../src/presentation/configurar-app.js';

describe('Listagens do cadastro (e2e, contrato da spec)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.CADASTRAMENTO_PORT ??= '3000';
    // import() dinamico: ver health.e2e-spec.ts
    const { AppModule } = await import('../src/app.module.js');
    const { APLICATIVO_REPOSITORY, CLIENTE_REPOSITORY } =
      await import('../src/presentation/cadastro/cadastro.module.js');
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CLIENTE_REPOSITORY)
      .useValue({
        listarTodos: async () => [{ codigo: 1, nome: 'Ana Souza', email: 'ana@exemplo.com' }],
      })
      .overrideProvider(APLICATIVO_REPOSITORY)
      .useValue({
        listarTodos: async () => [{ codigo: 2, nome: 'Financas', custoMensal: '29.90' }],
        // so o aplicativo 2 existe
        atualizarCusto: async (codigo: number, custoMensal: string) =>
          codigo === 2 ? { codigo, nome: 'Financas', custoMensal } : null,
      })
      .compile();
    app = modulo.createNestApplication();
    configurarApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['/servcad/clientes', [{ codigo: 1, nome: 'Ana Souza', email: 'ana@exemplo.com' }]],
    // spec: GET de aplicativos usa "custo" (P-02), como numero no JSON
    ['/servcad/aplicativos', [{ codigo: 2, nome: 'Financas', custo: 29.9 }]],
  ])('GET %s -> 200 com o formato da spec', async (rota, corpo) => {
    const res = await request(app.getHttpServer()).get(rota).expect(200);
    expect(res.body).toEqual(corpo);
  });

  it('PATCH /servcad/aplicativos/:id -> 200 com {codigo, nome, custoMensal}', async () => {
    const res = await request(app.getHttpServer())
      .patch('/servcad/aplicativos/2')
      .send({ custo: 24.9 })
      .expect(200);
    expect(res.body).toEqual({ codigo: 2, nome: 'Financas', custoMensal: 24.9 });
  });

  it('PATCH de aplicativo inexistente -> 404', async () => {
    await request(app.getHttpServer())
      .patch('/servcad/aplicativos/99')
      .send({ custo: 10 })
      .expect(404);
  });

  it.each([
    ['custo zero', { custo: 0 }],
    ['custo negativo', { custo: -5 }],
    ['3 casas decimais', { custo: 1.234 }],
    ['custo como texto', { custo: 'abc' }],
    ['sem custo', {}],
  ])('PATCH com %s -> 400', async (_nome, corpo) => {
    await request(app.getHttpServer()).patch('/servcad/aplicativos/2').send(corpo).expect(400);
  });
});
