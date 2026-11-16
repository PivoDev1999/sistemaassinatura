import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class ClienteResposta {
  @ApiProperty({ example: 1 }) codigo!: number;
  @ApiProperty({ example: 'Ana Souza' }) nome!: string;
  @ApiProperty({ example: 'ana.souza@exemplo.com' }) email!: string;
}

// Contrato [SPEC] de GET /servcad/aplicativos usa "custo" (P-02).
export class AplicativoResposta {
  @ApiProperty({ example: 1 }) codigo!: number;
  @ApiProperty({ example: 'Agenda Fácil' }) nome!: string;
  @ApiProperty({ example: 19.9 }) custo!: number;
}

export class AtualizarCustoEntrada {
  @ApiProperty({
    example: 24.9,
    description: 'Novo custo mensal (maior que zero, ate 2 casas decimais)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  custo!: number;
}

// Contrato [SPEC] de PATCH usa "custoMensal" na resposta (P-02, ADR 0007).
export class AplicativoAtualizadoResposta {
  @ApiProperty({ example: 1 }) codigo!: number;
  @ApiProperty({ example: 'Agenda Fácil' }) nome!: string;
  @ApiProperty({ example: 24.9 }) custoMensal!: number;
}
