const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    ststus: err.statusCode,
    error: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    ststus: err.statusCode,
    message: err.message,
  });

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else {
    sendErrorForProd(err, res);
  }
};

module.exports = globalError;
