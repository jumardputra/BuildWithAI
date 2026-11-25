import { resolve } from 'node:path';
import { defineConfig } from 'vite';

/**
 * Tujuh halaman. Halaman selain beranda diletakkan di foldernya sendiri
 * sehingga alamatnya bersih tanpa ekstensi: /panduan/, /ruang-kerja/, /masuk/.
 * dist/index.html tetap ada di akar.
 */
export default defineConfig({
  base: '/',
  appType: 'mpa',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ruangKerja: resolve(__dirname, 'ruang-kerja/index.html'),
        template: resolve(__dirname, 'template/index.html'),
        panduan: resolve(__dirname, 'panduan/index.html'),
        masuk: resolve(__dirname, 'masuk/index.html'),
        daftar: resolve(__dirname, 'daftar/index.html'),
        akun: resolve(__dirname, 'akun/index.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  },
  server: { proxy: { '/api': 'http://localhost:3000' } }
});
