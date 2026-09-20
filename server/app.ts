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

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Fashion Point Server Error]:', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred. Please try again or contact store support.'
  });
});

export default app;
