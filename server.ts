import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// API Routers
import authRouter from './server/routes/auth';
import adminAuthRouter from './server/routes/adminAuth';
import productsRouter from './server/routes/products';
import ordersRouter from './server/routes/orders';
import paymentsRouter from './server/routes/payments';
import couponsRouter from './server/routes/coupons';
import adminRouter from './server/routes/admin';
import customerRouter from './server/routes/customer';
import postalRouter from './server/routes/postal';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security & parsing middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic CORS & Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      store: 'Fashion Point / Meraj',
      version: '2.0.0-production',
      timestamp: new Date().toISOString()
    });
  });

  // Mount API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/admin/auth', adminAuthRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/coupons', couponsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/customer', customerRouter);
  app.use('/api/postal', postalRouter);

  // Global error handler (Never expose raw stack traces to client)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Fashion Point Server Error]:', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred. Please try again or contact store support.'
    });
  });

  // Vite middleware for development / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fashion Point Production Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
