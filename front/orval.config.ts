import { defineConfig } from 'orval'

export default defineConfig({
  backend: {
    input: '../back/openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/model',
      client: 'swr',
      mock: false,
      clean: true,
      override: {
        mutator: {
          path: './src/api/nextFetch.ts',
          name: 'nextFetch',
        },
        formData: {
          path: './src/api/mutator/customFormData.ts',
          name: 'customFormData',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
})
