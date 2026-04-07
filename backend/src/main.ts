import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';

console.log('ENV CHECK:', {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  dbUrl: process.env.DATABASE_URL ? 'SET' : 'MISSING',
  jwtSecret: process.env.JWT_SECRET ? 'SET' : 'MISSING',
  frontendUrl: process.env.FRONTEND_URL ? 'SET' : 'MISSING',
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  // Security headers
  app.use(helmet());

  // Allow frontend to talk to backend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global prefix — all routes will be /api/...
  app.setGlobalPrefix('api');

  // Auto-validate all incoming request bodies
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();