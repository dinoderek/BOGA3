import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/data/schema/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './drizzle/local.db',
  },
  strict: true,
  verbose: true,
});
