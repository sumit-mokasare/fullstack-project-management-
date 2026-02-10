import { body } from 'express-validator';

const userRegistrationValidatore = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('email is required')
      .isEmail()
      .withMessage('email is invalid'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('username is required')
      .isLength({ min: 3 })
      .withMessage('username should be at least 3 char')
      .isLength({ max: 13 })
      .withMessage('username connot exceed 13 char'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('password is required')
      .isLength({ min: 8 })
      .withMessage('password must be at least 8 charector'),
  ];
};

const userLoginValidator = () => {
  return [
    body('email').trim().isEmail().withMessage('Email is not valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('password cannot be empty')
      .isLength({ min: 8 })
      .withMessage('password must be at least 8 charector'),
  ];
};

//========= project validetor  ======

const projectCreateValidetor = () => {
  return [
    body('name').notEmpty().trim().isLength({ min: 3 }).withMessage('Project name is Invalid'),
    body('description').notEmpty().trim().isLength({ min: 5 }).withMessage('Description is Invalid'),
  ];
};

export { userLoginValidator, userRegistrationValidatore, projectCreateValidetor };
