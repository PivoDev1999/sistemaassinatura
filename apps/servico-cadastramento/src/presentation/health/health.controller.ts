import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verifica se o servico esta no ar' })
  @ApiOkResponse({
    description: 'Servico saudavel',
    schema: {
      type: 'object',
      properties: { status: { type: 'string' } },
      example: { status: 'ok' },
    },
  })
  verificar(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
