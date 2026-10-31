import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Brightloop Subscription Management Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0-hackathon',
  });
});

// Modular Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/billing', billingRoutes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Brightloop Subscription Backend is running on port ${PORT}`);
    console.log(`   Customer Portal API: http://localhost:${PORT}/api/customer`);
    console.log(`   Auth API:            http://localhost:${PORT}/api/auth`);
    console.log(`   Health Check:        http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
