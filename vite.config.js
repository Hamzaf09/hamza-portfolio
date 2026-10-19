import { resolve } from 'node:path';

export default {
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        aiCreation: resolve(__dirname, 'ai-creation/index.html'),
        thoughts: resolve(__dirname, 'thoughts/index.html'),
        youtube: resolve(__dirname, 'youtube/index.html'),
        consultation: resolve(__dirname, 'consultation/index.html'),
      },
    },
  },
};
