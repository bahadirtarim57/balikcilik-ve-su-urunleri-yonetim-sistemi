import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

// Custom plugin to handle JSON saves
const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/save-articles' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const { fileName, data } = JSON.parse(body);
            
            // Map fileName to actual path
            const safeFiles = ['law_articles.json', 'regulation_articles.json', 'teblig_ticari.json', 'teblig_amator.json'];
            
            if (!safeFiles.includes(fileName)) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Invalid file name' }));
            }

            const filePath = path.resolve('src/data', fileName);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error('Error saving file:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else if (req.url === '/api/sync-folder' && req.method === 'POST') {
        try {
          const os = require('os');
          const desktopPath = path.join(os.homedir(), 'Desktop', 'Balikcilik_Ve_Su_Urunleri_Sube_Yonetimi');
          if (!fs.existsSync(desktopPath)) {
            fs.mkdirSync(desktopPath, { recursive: true });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ message: 'Klasör bulunamadı, masaüstünde oluşturuldu. Lütfen güncel JSON dosyalarını klasöre atıp tekrar deneyin.', copied: [] }));
          }

          const targetFiles = ['excel_cezalar.json', 'law_articles.json', 'regulation_articles.json', 'teblig_ticari.json', 'teblig_amator.json'];
          let copiedFiles = [];
          
          targetFiles.forEach(file => {
            const sourcePath = path.join(desktopPath, file);
            if (fs.existsSync(sourcePath)) {
              const destPath = path.resolve('src/data', file);
              fs.copyFileSync(sourcePath, destPath);
              copiedFiles.push(file);
            }
          });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, copied: copiedFiles }));
        } catch (error) {
          console.error('Error syncing folder:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: error.message }));
        }
      } else if (req.url === '/api/save-tesisler' && req.method === 'POST') { let body = ''; req.on('data', chunk => { body += chunk.toString(); }); req.on('end', () => { try { const data = JSON.parse(body); const filePath = path.resolve('src/data', 'sinopTesisler_Master.json'); fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8'); res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ success: true })); } catch (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error.message })); } }); } else if (req.url === '/api/get-tesisler' && req.method === 'GET') { try { const filePath = path.resolve('src/data', 'sinopTesisler_Master.json'); if (fs.existsSync(filePath)) { const data = fs.readFileSync(filePath, 'utf-8'); res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.end(data); } else { res.statusCode = 200; res.end('[]'); } } catch (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error.message })); } } else if (req.url === '/api/apply-increase' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
          try {
            const { percentage } = JSON.parse(body);
            if (typeof percentage !== 'number') throw new Error('Geçersiz oran');
            
            const multiplier = 1 + (percentage / 100);
            const filePath = path.resolve('src/data', 'excel_cezalar.json');
            
            if (fs.existsSync(filePath)) {
              let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              data = data.map(item => {
                if (item.para_cezasi_tl && !isNaN(item.para_cezasi_tl)) {
                   item.para_cezasi_tl = Math.round(Number(item.para_cezasi_tl) * multiplier).toString();
                }
                return item;
              });
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            }
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error('Error applying increase:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else if (req.url === '/api/publish' && req.method === 'POST') {
        const { exec } = require('child_process');
        res.setHeader('Content-Type', 'application/json');
        
        exec('git add . && git commit --allow-empty -m "Arayuz uzerinden otomatik guncelleme" && git pull origin main --rebase && git push origin main', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
          if (error) {
            console.error('Publish error:', error);
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: error.message, stderr }));
          }
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, stdout }));
        });
      } else if (req.url === '/api/download-zip' && req.method === 'GET') {
        const { exec } = require('child_process');
        const downloadName = 'Balikcilik_Su_Urunleri_Yedek.zip';
        const tempZipName = `temp_yedek_${Date.now()}.zip`;
        const zipPath = path.resolve(tempZipName);
        
        exec(`tar.exe -a -c -f "${zipPath}" src public index.html package.json vite.config.js eslint.config.js .gitignore`, { maxBuffer: 1024 * 1024 * 10 }, (error) => {
          if (error) {
            console.error('Zip creation error:', error);
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: error.message }));
          }
          
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', `attachment; filename=${downloadName}`);
          
          const readStream = fs.createReadStream(zipPath);
          readStream.pipe(res);
          readStream.on('close', () => {
             try { fs.unlinkSync(zipPath); } catch (e) {}
          });
          readStream.on('error', (err) => {
             res.statusCode = 500;
             res.end(JSON.stringify({ error: err.message }));
          });
        });
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    apiPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { maximumFileSizeToCacheInBytes: 6000000 },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
          name: 'Balıkçılık ve Su Ürünleri Yönetim Sistemi',
          short_name: 'BSÜSY',
          description: 'Sinop İl Tarım ve Orman Müdürlüğü - Balıkçılık ve Su Ürünleri Yönetim ve Denetim Sistemi',
          theme_color: '#0ea5e9',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
    })
  ],
  server: {
    port: 5174,
    strictPort: true
  }
})
