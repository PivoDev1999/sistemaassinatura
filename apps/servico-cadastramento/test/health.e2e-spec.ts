import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configurarApp } from '../src/presentation/configurar-app';

describe('Health e Swagger (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.CADASTRAMENTO_PORT ??= '3000';
    const { AppModule } = await import('../src/app.module');
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
