import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';

import tailwind from '@tailwindcss/postcss';

export default defineConfig({
  performance: {
    chunkSplit: 'all-in-one'
  },
  dev: {
    hmr: false,
    liveReload: false,
    writeToDisk: true
  },
  tools: {
    postcss: (_, { addPlugins }) => {
      addPlugins(tailwind)
    },
    htmlPlugin: {
      publicPath: ''
    }
  },
  environments: {
    popup: {
      output: {
        target: 'web'
      },
      source: {
        entry: {
          popup: './src/popup/index.js'
        }
      },
      plugins: [pluginReact()]
    },
    script: {
      output: {
        target: 'web',
        legalComments: 'inline',
        filename: {
          js: '[name].js'
        }
      },
      source: {
        entry: {
          script: {
            import: './src/index.js',
            html: false
          }
        }
      }
    }
  },
});
