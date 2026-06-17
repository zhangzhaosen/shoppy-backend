import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useLogger(app.get(Logger))
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));
   app.use(cookieParser());
  await app.listen(app.get(ConfigService).getOrThrow('PORT'));
}
bootstrap();