import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuracao, validarConfiguracao } from './infrastructure/config/configuracao.js';
import { CadastroModule } from './presentation/cadastro/cadastro.module.js';
import { HealthModule } from './presentation/health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      load: [configuracao],
      validate: validarConfiguracao,
    }),
    HealthModule,
    CadastroModule,
  ],
})
export class AppModule {}
