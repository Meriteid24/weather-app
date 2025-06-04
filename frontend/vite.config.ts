import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Changed from plugin-react-swc to standard plugin
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ServerResponse, IncomingMessage, ClientRequest } from "http";

export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy) => {
          proxy.on('error', (err: Error, req: IncomingMessage, res: ServerResponse) => {
            console.error('Proxy Error:', err);
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('Proxy connection failed');
          });
          proxy.on('proxyReq', (proxyReq: ClientRequest) => {
            console.log('Proxying:', proxyReq.method, proxyReq.path);
            proxyReq.setHeader('X-Forwarded-Host', 'localhost:3000');
          });
          proxy.on('proxyRes', (proxyRes: IncomingMessage, req: IncomingMessage) => {
            console.log('Received:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/broadcasting': {
        target: 'https://weather-app-hqyy.onrender.com',
        ws: true,
        secure: false,
      },
    },
  },
  plugins: [
    react({
      // Babel configuration fallback
      babel: {
        plugins: [
          // Add any necessary Babel plugins here
        ],
      },
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Removed SWC-specific optimization
    include: [
      'react',
      'react-dom',
      // Add other dependencies that need optimization
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: [
        // Add any modules that should stay external
      ],
    },
  },
  esbuild: {
    // Additional ESBuild configuration
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
}));