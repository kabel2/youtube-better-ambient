import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['chrome > 100', 'firefox > 100'],
    },
  ],
});
