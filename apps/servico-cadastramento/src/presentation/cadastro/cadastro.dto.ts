import { ApiProperty } from '@nestjs/swagger';

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
