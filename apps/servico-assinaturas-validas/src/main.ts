import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { lerConfiguracao } from './infrastructure/config/configuracao';
import { configurarApp } from './presentation/configurar-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configurarApp(app);
  const { porta } = lerConfiguracao(process.env);
  await app.listen(porta);
}

void bootstrap();
