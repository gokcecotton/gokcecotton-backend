import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status,
      message: err.name,
      data: err,
    });
    return;
  }

  // Log the error using Pino attached to req
  if (req.log) {
    req.log.error(err);
  } else {
    console.error(err);
  }

  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
};
