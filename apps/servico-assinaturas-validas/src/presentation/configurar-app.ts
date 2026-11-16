import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configurarApp(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Servico de Assinaturas Validas')
    .setDescription('API do Servico de Assinaturas Validas')
    .setVersion('0.0.1')
    .build();
  const documento = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documento, { jsonDocumentUrl: 'docs-json' });
}
