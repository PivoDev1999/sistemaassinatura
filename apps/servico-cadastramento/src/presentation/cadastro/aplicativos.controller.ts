import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AtualizarCustoAplicativoUseCase } from '../../application/atualizar-custo-aplicativo.use-case.js';
import { ListarAplicativosUseCase } from '../../application/listar-aplicativos.use-case.js';
import { AplicativoNaoEncontradoError } from '../../domain/cadastro.js';
import {
  AplicativoAtualizadoResposta,
  AplicativoResposta,
  AtualizarCustoEntrada,
} from './cadastro.dto.js';

@ApiTags('aplicativos')
@Controller('servcad/aplicativos')
export class AplicativosController {
  constructor(
    private readonly listarAplicativos: ListarAplicativosUseCase,
    private readonly atualizarCusto: AtualizarCustoAplicativoUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: [AplicativoResposta] })
  async listar(): Promise<AplicativoResposta[]> {
    const aplicativos = await this.listarAplicativos.executar();
    // custoMensal (dominio, texto decimal) -> custo (contrato, numero no JSON)
    return aplicativos.map((a) => ({
      codigo: a.codigo,
      nome: a.nome,
      custo: Number(a.custoMensal),
    }));
  }

  @Patch(':idAplicativo')
  @ApiOkResponse({ type: AplicativoAtualizadoResposta })
  @ApiNotFoundResponse({ description: 'Aplicativo nao existe' })
  async atualizar(
    @Param('idAplicativo', ParseIntPipe) idAplicativo: number,
    @Body() entrada: AtualizarCustoEntrada,
  ): Promise<AplicativoAtualizadoResposta> {
    try {
      const a = await this.atualizarCusto.executar(idAplicativo, entrada.custo.toFixed(2));
      return { codigo: a.codigo, nome: a.nome, custoMensal: Number(a.custoMensal) };
    } catch (erro) {
      if (erro instanceof AplicativoNaoEncontradoError) throw new NotFoundException(erro.message);
      throw erro;
    }
  }
}
