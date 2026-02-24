import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema/**/*.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/auth2x_ultra',
  },
  verbose: true,
  strict: true,
} satisfies Config;
