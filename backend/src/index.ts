import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import quotationRoutes from './routes/quotations';
import subscriptionRoutes from './routes/subscriptions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'brightloop-backend', timestamp: new Date().toISOString() });
});

// Routes – Member 3
app.use('/api/quotations', quotationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Brightloop backend running on http://localhost:${PORT}`);
});

export default app;
