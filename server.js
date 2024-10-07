const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');
// Routes
const mountRoutes = require('./routes');

// connect with db
dbConnection();

// express app
const app = express();

// Enable other domins to access your application
app.use(cors());
app.options('*', cors()); // include before other routes

// compress all responses
app.use(compression());

// Middlewares --> Barse code string to json
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

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
