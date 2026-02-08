import { validationResult } from 'express-validator';
import { apiError } from '../utils/api-error.js';
export const validate = (req, res, next) => {
  const error = validationResult(req);
  // console.log('validation error massage', error);

  if (error.isEmpty()) {
    return next();
  }
  const extractedError = [];

  error.array().map((err) =>
    extractedError.push({
      [err.path]: err.msg,
    })
  );

  new apiError(402, 'Recieved data is not valid', extractedError);
};

export default validate;
