import 'dotenv/config';
import { hash } from 'argon2';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const SEED_PASSWORD = 'Password123!';

const seedUsers = [
    {
        email: 'internal1@example.com',
        first_name: 'Alice',
        last_name: 'Admin',
        relation: 'internals' as const,
    },
    {
        email: 'internal2@example.com',
        first_name: 'Bob',
        last_name: 'Ops',
        relation: 'internals' as const,
    },
    {
        email: 'internal3@example.com',
        first_name: 'Carol',
        last_name: 'Support',
        relation: 'internals' as const,
    },
    {
        email: 'counselor1@example.com',
        first_name: 'Diana',
        last_name: 'Guide',
        relation: 'counselors' as const,
    },
    {
        email: 'counselor2@example.com',
        first_name: 'Ethan',
        last_name: 'Mentor',
        relation: 'counselors' as const,
    },
    {
        email: 'counselor3@example.com',
        first_name: 'Fiona',
        last_name: 'Coach',
        relation: 'counselors' as const,
    },
    {
        email: 'patient1@example.com',
        first_name: 'Grace',
        last_name: 'Client',
        relation: 'patients' as const,
    },
    {
        email: 'patient2@example.com',
        first_name: 'Henry',
        last_name: 'Member',
        relation: 'patients' as const,
    },
    {
        email: 'patient3@example.com',
        first_name: 'Ivy',
        last_name: 'Visitor',
        relation: 'patients' as const,
    },
];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
    const hashedPassword = await hash(SEED_PASSWORD);

    for (const user of seedUsers) {
        await prisma.users.upsert({
            where: { email: user.email },
            update: {},
            create: {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                hashed_password: hashedPassword,
                email_verified_at: new Date(),
                [user.relation]: { create: {} },
            },
        });
    }

    console.log(`Seeded ${seedUsers.length} users (password: ${SEED_PASSWORD})`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
