const path = require('path');

const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config({ path: 'config.env' });
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');
const dbConnection = require('./config/database');
// Routes
const categoryRoute = require('./routes/categoryRoute');
const subCategoryRoute = require('./routes/subCategoryRoute');
const brandRoute = require('./routes/brandRoute');
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const reviewRoute = require('./routes/reviewRoute');
const wishlistRoute = require('./routes/wishlistRoute');
const addressRoute = require('./routes/addressRoute');
const couponRoute = require('./routes/couponRoute');

// connect with db
dbConnection();
// express app
const app = express();

// Middlewares --> Barse code string to json
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

//Mount  Routes
app.use('/api/v1/categories', categoryRoute);
app.use('/api/v1/subcategories', subCategoryRoute);
app.use('/api/v1/brands', brandRoute);
app.use('/api/v1/products', productRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/wishlist', wishlistRoute);
app.use('/api/v1/addresses', addressRoute);
app.use('/api/v1/coupons', couponRoute);

app.all('*', (req, res, next) => {
  // Create a 404 error and pass it to the global error handler
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});
//global error handling middleware
app.use(globalError);
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handel rejection  outside express
process.on('unhandledRejection', (err) => {
  console.error(`unhandledRejection Error : ${err.name} | ${err.message} `);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
