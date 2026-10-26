## Getting Started

Follow these steps to initialize the environment, install required packages, and prepare the database client for the authentication module.

### 1. Install Dependencies

Install the core dependencies, including the NestJS packages, Prisma ORM, and authentication libraries (such as Argon2 and JWT).

```bash
npm install
```

## Environment Configuration

The backend service relies on environment variables to establish database connections, initialize containers, and manage security parameters. 

Create a `.env` file in the root directory of the project. Below is the required structure, sectioned by the operational domain each variable controls:

POSTGRESQL CONTAINER INITIALIZATION
```env
POSTGRES_USER=user_name
POSTGRES_PASSWORD=user_password
POSTGRES_DB=database_name

DATABASE_URL=url
MAX_POOL_CONNECTIONS=number_of_concurrent connections
MIN_POOL_CONNECTIONS=number_of_idle connections

JWT_SECRET_KEY=JWT secret key

```


```POSTGRES_USER```: The username used to initialize the PostgreSQL database container.

```POSTGRES_PASSWORD```: The password assigned to the database user for authentication.

```POSTGRES_DB```: The name of the default database created upon container initialization.

```DATABASE_URL```: The connection string used by Prisma Client to connect to the PostgreSQL instance.
Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

```MAX_POOL_CONNECTIONS```: Number of concurrent connections default is 10

```MIN_POOL_CONNECTIONS```: Number of allowed idle connections default is 2

```JWT_SECRET_KEY```: A secure cryptographic key used to sign and verify the integrity of the JWT tokens

## Database & Prisma Setup

Once your environment variables are configured and your PostgreSQL container is running, you need to execute the database migrations and generate the Prisma Client. This ensures your database schema is up-to-date and your backend code has the correct TypeScript/JavaScript types to interact with it.

### 1. Apply Migrations

Run the following command to execute the existing migration files against your database. This will create the necessary tables and relationships defined in your `prisma/schema.prisma` file.

```bash
npx prisma migrate dev
```


### 2. Generate Prisma Client

After the database schema is updated, generate the Prisma Client. This reads your Prisma schema and generates a tailored query builder inside node_modules/@prisma/client for your backend code to use.

```bash
npx prisma generate
```