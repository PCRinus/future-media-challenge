import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../../openapi.json',
    output: {
      target: './src/api/generated.ts',
      schemas: './src/api/model',
      client: 'react-query',
      mode: 'tags-split',
      clean: true,
      prettier: true,
    },
  },
});
