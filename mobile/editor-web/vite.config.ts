import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// This config is used to build the web editor into a single file
const exec = require('child_process').exec;

export default defineConfig({
  root: './editor-web', // This should be the directory of your index.html
  build: {
    outDir: 'build',
    emptyOutDir: false,
  },
  resolve: {
    alias: [
      {
        find: '@10play/tentap-editor', // On our web bundle we only want to include web related code
        replacement: '@10play/tentap-editor/web',
      },
      // We alias tiptap view and state to use the internal version of tiptap to avoid this error https://github.com/ueberdostiptap/issues/3869#issuecomment-2167931620
      {
        find: '@tiptap/pm/view',
        replacement: '@10play/tentap-editor/web',
      },
      {
        find: '@tiptap/pm/state',
        replacement: '@10play/tentap-editor/web',
      },
    ],
  },
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'postbuild-commands',
      closeBundle: async () => {
        exec('yarn editor:post-build', (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
        });
      },
    },
  ],
  server: {
    port: 3000,
  },
});
