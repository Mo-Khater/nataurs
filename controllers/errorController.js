const app = require('../app');
const appError = require('../utils/appError');

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new appError(message, 400);
};

const handelCastError = (err) => {
  const message = `invalid ${err.path}:${err.value}`;
  return new appError(message, 400);
};
const senddev = (res, err, req) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message,
    });
  }
};

const handleJsonWebTokenError = () => {
  return new appError('invalid token', 401);
};
const handleTokenExpiredError = () => {
  return new appError('expired token', 401);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new appError(message, 400);
};

const sendprod = (res, err) => {
  if (req.originalUrl.startsWith('/api'))
  {
    if (err.isoperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(err.statusCode).json({
        status: err.status,
        message: 'something went wrong',
      });
    }
  }else {
    if (err.isoperational) {
      res.status(err.statusCode).render('error', {
        title: 'something went wrong',
        msg: err.message,
      });
    } else {
      res.status(err.statusCode).render('error', {
        title: 'something went wrong',
        msg: "something went wrong",
      });
    }
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    senddev(res, err, req);
  } else if (process.env.NODE_ENV === 'production') {
    let error;
    if (err.name === 'CastError') error = handelCastError(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJsonWebTokenError(err);
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError(err);
    sendprod(res, error);
  }
};
