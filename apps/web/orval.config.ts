import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../../openapi.json',
    output: {
      target: './src/api/generated.ts',
      schemas: './src/api/model',
      client: 'react-query',
      mode: 'tags-split',
      clean: [
        './src/api/model',
        './src/api/auth',
        './src/api/health',
        './src/api/messages',
        './src/api/tags',
        './src/api/users',
      ],
      prettier: true,
      override: {
        mutator: {
          path: './src/lib/api-client.ts',
          name: 'fetchInstance',
        },
      },
      httpClient: 'axios',
    },
  },
});
