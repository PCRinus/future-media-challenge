import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Future Media Challenge API')
    .setDescription('The API for the Future Media Challenge application')
    .setVersion('1.0')
    .setOpenAPIVersion('3.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = resolve(__dirname, '..', 'openapi.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`OpenAPI spec written to ${outputPath}`);
  await app.close();
}

generate();
