import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor() {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            max: Number(process.env.MAX_POOL_CONNECTIONS) || 10,
            min: Number(process.env.MIN_POOL_CONNECTIONS) || 2,
        });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            await this.$queryRaw`SELECT 1`;
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
