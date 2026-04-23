import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ====================== BODY SIZE ======================
  // ✅ Augmenter la limite pour accepter les images en base64
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // ====================== SÉCURITÉ ======================
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // ====================== OPTIMISATION ======================
  app.use(compression.default ? compression.default() : (compression as any)());

  // ====================== VALIDATION GLOBALE ======================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ====================== CORS ======================
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ====================== LANCEMENT ======================
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Backend NestJS démarré sur http://localhost:${port}`);
}

bootstrap();
