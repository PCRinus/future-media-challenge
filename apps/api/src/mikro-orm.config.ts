import { resolve } from 'node:path';

import { config } from 'dotenv';

config({ path: [resolve(__dirname, '..', '.env'), resolve(__dirname, '..', '..', '..', '.env')] });

import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  extensions: [Migrator],
  migrations: {
    path: './src/migrations',
    pathTs: './src/migrations',
  },
});
