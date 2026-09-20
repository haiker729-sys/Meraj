import express from 'express';

// API Routers
import authRouter from './routes/auth';
import adminAuthRouter from './routes/adminAuth';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import paymentsRouter from './routes/payments';
import couponsRouter from './routes/coupons';
import adminRouter from './routes/admin';
import customerRouter from './routes/customer';
import postalRouter from './routes/postal';

export const app = express();

// Security & parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic CORS & Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Health checks (available at multiple aliases for Vercel / proxy compatibility)
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    store: 'Fashion Point / Meraj',
    version: '2.0.0-production',
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', healthHandler);

// Mount API Routers (supports both /api/* and /* paths for zero-config Vercel rewrites)
const apiRoutes = [
  ['/auth', authRouter],
  ['/admin/auth', adminAuthRouter],
  ['/products', productsRouter],
  ['/orders', ordersRouter],
  ['/payments', paymentsRouter],
  ['/coupons', couponsRouter],
  ['/admin', adminRouter],
  ['/customer', customerRouter],
  ['/postal', postalRouter]
] as const;

apiRoutes.forEach(([routePath, router]) => {
  app.use(`/api${routePath}`, router);
  app.use(routePath, router);
});

// JSON 404 for unhandled API endpoints
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/products') || req.path.startsWith('/orders') || req.headers.accept?.includes('application/json')) {
    res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl || req.url}`
    });
    return;
  }
  next();
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Fashion Point Server Error]:', err?.message || err);
  res.status(err?.status || 500).json({
    success: false,
    error: err?.message || 'An internal server error occurred. Please try again or contact store support.'
  });
});

export default app;
