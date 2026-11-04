import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        instrument: ObserveInstrument,
    });

    app.enableCors({
        origin: ['http://localhost:3001'],
        methods: ['GET', 'POST', 'UPDATE', 'DELETE'],
        credentials: true,
    });

    await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
