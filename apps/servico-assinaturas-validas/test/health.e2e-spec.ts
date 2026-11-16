import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configurarApp } from '../src/presentation/configurar-app.js';

describe('Health e Swagger (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ASSINATURAS_VALIDAS_PORT ??= '3000';
    // import() dinamico necessario: o ConfigModule.forRoot valida a porta ao importar o modulo,
    // e imports estaticos sao avaliados antes do beforeAll definir a variavel de ambiente.
    const { AppModule } = await import('../src/app.module.js');
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    configurarApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['/health', { status: 'ok' }],
    ['/docs-json', undefined],
  ])('GET %s -> 200', async (rota, corpo) => {
    const res = await request(app.getHttpServer()).get(rota).expect(200);
    if (corpo) expect(res.body).toEqual(corpo);
    else expect(res.body.openapi).toBeDefined();
  });
});
