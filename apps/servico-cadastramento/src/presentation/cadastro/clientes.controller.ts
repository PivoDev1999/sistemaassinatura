import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListarClientesUseCase } from '../../application/listar-clientes.use-case.js';
import { ClienteResposta } from './cadastro.dto.js';

@ApiTags('clientes')
@Controller('servcad/clientes')
export class ClientesController {
  constructor(private readonly listarClientes: ListarClientesUseCase) {}

  @Get()
  @ApiOkResponse({ type: [ClienteResposta] })
  listar(): Promise<ClienteResposta[]> {
    return this.listarClientes.executar();
  }
}
