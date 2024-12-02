/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración global de WebSocket
  app.useWebSocketAdapter(new IoAdapter(app));

  // Habilitar el manejo de cookies
  app.use(cookieParser());

  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'], // URL del frontend
    methods: ['GET', 'POST'],
    credentials: true,
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
