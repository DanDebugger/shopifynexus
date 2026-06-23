import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './app/drizzle/schema.server.ts',
  out: './app/drizzle/migrations',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'mysql://root:rootpassword@0.0.0.0:3307/nexuslab_app',
  },
});
