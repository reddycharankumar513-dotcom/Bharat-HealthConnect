import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import labRoutes from './routes/lab.routes.js';
import adminRoutes from './routes/admin.routes.js';
import supplierRoutes from './routes/supplier.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists (fallback to /tmp in serverless/Vercel)
const uploadDir = process.env.VERCEL === '1'
  ? path.join('/tmp', 'uploads', 'reports')
  : path.resolve(process.cwd(), 'uploads/reports');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create upload directory:', e);
}

// Serve uploaded static files
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Bharat HealthConnect API Backend',
    tagline: 'One Nation. One Connected Healthcare Ecosystem.',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supplier', supplierRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Start Server (only if not running in serverless environment like Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏥 Bharat HealthConnect API Server`);
    console.log(`🚀 Running at: http://localhost:${PORT}`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
