import { Module } from '@nestjs/common';
import { ListarAplicativosUseCase } from '../../application/listar-aplicativos.use-case.js';
import { ListarClientesUseCase } from '../../application/listar-clientes.use-case.js';
import type { AplicativoRepository, ClienteRepository } from '../../domain/cadastro.js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { PrismaAplicativoRepository } from '../../infrastructure/repositories/prisma-aplicativo.repository.js';
import { PrismaClienteRepository } from '../../infrastructure/repositories/prisma-cliente.repository.js';
import { AplicativosController } from './aplicativos.controller.js';
import { ClientesController } from './clientes.controller.js';

export const CLIENTE_REPOSITORY = Symbol('CLIENTE_REPOSITORY');
export const APLICATIVO_REPOSITORY = Symbol('APLICATIVO_REPOSITORY');

// Unico lugar que liga interface -> implementacao (regra de dependencia).
// Os casos de uso sao classes puras (sem decorators do Nest), entao entram por factory.
@Module({
  controllers: [ClientesController, AplicativosController],
  providers: [
    PrismaService,
    { provide: CLIENTE_REPOSITORY, useClass: PrismaClienteRepository },
    { provide: APLICATIVO_REPOSITORY, useClass: PrismaAplicativoRepository },
    {
      provide: ListarClientesUseCase,
      useFactory: (repo: ClienteRepository) => new ListarClientesUseCase(repo),
      inject: [CLIENTE_REPOSITORY],
    },
    {
      provide: ListarAplicativosUseCase,
      useFactory: (repo: AplicativoRepository) => new ListarAplicativosUseCase(repo),
      inject: [APLICATIVO_REPOSITORY],
    },
  ],
})
export class CadastroModule {}
