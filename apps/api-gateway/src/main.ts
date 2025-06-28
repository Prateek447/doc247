/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Basic middleware
app.use(morgan('dev'));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration - Updated to allow frontend requests
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  standardHeaders: true,
  legacyHeaders: true,
  message: { error: 'Too many requests, please try again later.' },
  keyGenerator: (req: any) => req.ip
});

app.use(limiter);

// Health check endpoint
app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

// Proxy configuration
const proxyOptions = {
  target: 'http://127.0.0.1:6001',
  changeOrigin: true,
  ws: true,
  logLevel: 'debug' as const,
  onError: (err: Error, req: express.Request, res: express.Response) => {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  },
  onProxyReq: (proxyReq: any, req: express.Request, res: express.Response) => {
    // Log proxy requests for debugging
    console.log('Proxying:', req.method, req.url, 'to', proxyOptions.target + req.url);
  }
};

// Apply proxy middleware
app.use('/', createProxyMiddleware(proxyOptions));

const port = Number(process.env.PORT) || 8080;
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`API Gateway is running on http://127.0.0.1:${port}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
