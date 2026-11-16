import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configurarApp(app: INestApplication): void {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const config = new DocumentBuilder()
    .setTitle('Servico de Cadastramento')
    .setDescription('API do Servico de Cadastramento')
    .setVersion('0.0.1')
    .build();
  const documento = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documento, { jsonDocumentUrl: 'docs-json' });
}
