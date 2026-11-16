import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListarAplicativosUseCase } from '../../application/listar-aplicativos.use-case.js';
import { AplicativoResposta } from './cadastro.dto.js';

@ApiTags('aplicativos')
@Controller('servcad/aplicativos')
export class AplicativosController {
  constructor(private readonly listarAplicativos: ListarAplicativosUseCase) {}

  @Get()
  @ApiOkResponse({ type: [AplicativoResposta] })
  async listar(): Promise<AplicativoResposta[]> {
    const aplicativos = await this.listarAplicativos.executar();
    // custoMensal (dominio, texto decimal) -> custo (contrato, numero no JSON)
    return aplicativos.map((a) => ({ codigo: a.codigo, nome: a.nome, custo: Number(a.custoMensal) }));
  }
}
