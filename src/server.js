const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const { responseOptimizer } = require('./middleware/responseOptimizer');
const createIndexes = require('./utils/createIndexes');

// Import routes
const partnerRoutes = require('./routes/partner');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const leadRoutes = require('./routes/leads');
const commissionRoutes = require('./routes/commission');
const uploadRoutes = require('./routes/upload');
const otpRoutes = require('./routes/otp');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');

// Initialize express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Connect to database and create indexes
connectDB().then(() => {
  // Create database indexes for better performance
  setTimeout(createIndexes, 2000);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware (order matters for performance)
app.use(compression()); // Enable gzip compression
app.use(limiter); // Apply rate limiting
app.use(responseOptimizer); // Response optimization
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    optionsSuccessStatus: 200, // For legacy browser support
  })
);
app.use(express.json({ limit: '10mb' })); // Body parser with limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Only use morgan in development
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Serve static files (uploads) - serve the entire uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/partner', partnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/commission', commissionRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route (optimized)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  console.log(`❌ Error: ${err.message}`);
  process.exit(1);
});
