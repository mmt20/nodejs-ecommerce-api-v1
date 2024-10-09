const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const { rateLimit } = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');
// Routes
const mountRoutes = require('./routes');
const { webhookCheckout } = require('./services/orderService');

// connect with db
dbConnection();

// express app
const app = express();

// Enable other domins to access your application
app.use(cors());
app.options('*', cors()); // include before other routes

// compress all responses
app.use(compression());

// checkout webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  webhookCheckout
);

// Middlewares --> Barse code string to json
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Apply data sanitization
app.use(mongoSanitize());
app.use(xss());

// Limit each IP to 100 requests per `window` (15 minutes) only in non-development environments
if (process.env.NODE_ENV !== 'development') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message:
      'Too many accounts created from this IP, please try again after an hour',
  });

  // Apply the rate limiting middleware to all requests.
  app.use('/api', limiter);
}

// Middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      'sold',
      'price',
      'quantity',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  })
);

//Mount  Routes
mountRoutes(app);

app.all('*', (req, res, next) => {
  // Create a 404 error and pass it to the global error handler
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle rejection outside express
process.on('unhandledRejection', (err) => {
  console.error(`unhandledRejection Error : ${err.name} | ${err.message} `);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
