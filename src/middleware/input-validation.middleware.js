const { check, validationResult } = require('express-validator');

const validateUserEmailInput = (req, res, next) => {
  const validationRules = [
    check('email')
      .isEmail()
      .withMessage('Invalid email format')
      .not()
      .isEmpty()
      .withMessage('Email is required'),
  ];

  Promise.all(validationRules.map((validation) => validation.run(req))).then(
    () => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res.status(400).json({ message: errorMessages });
      }

      next();
    }
  );
};

const validateUserSignUpInput = (req, res, next) => {
  const validationRules = [
    check('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long')
      .not()
      .isEmpty()
      .withMessage('Username is required'),

    check('email')
      .isEmail()
      .withMessage('Invalid email format')
      .not()
      .isEmpty()
      .withMessage('Email is required'),

    check('address').not().isEmpty().withMessage('address is required'),

    check('phoneNumber')
      .not()
      .isEmpty()
      .withMessage('Phone Number is required'),

    check('postCode').not().isEmpty().withMessage('Post Code is required'),
  ];

  Promise.all(validationRules.map((validation) => validation.run(req))).then(
    () => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res.status(400).json({ message: errorMessages });
      }
      next();
    }
  );
};

const validateUserPasswordInput = (req, res, next) => {
  const validationRules = [
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .not()
      .isEmpty()
      .withMessage('Password is required'),
  ];

  Promise.all(validationRules.map((validation) => validation.run(req))).then(
    () => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res.status(400).json({ message: errorMessages });
      }
      next();
    }
  );
};

const validateUserLoginInput = (req, res, next) => {
  const validationRules = [
    check('email')
      .isEmail()
      .withMessage('Invalid email format')
      .not()
      .isEmpty()
      .withMessage('Email is required'),

    check('password').not().isEmpty().withMessage('Password is required'),
  ];

  Promise.all(validationRules.map((validation) => validation.run(req))).then(
    () => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res.status(400).json({ message: errorMessages });
      }
      next();
    }
  );
};

module.exports = {
  validateUserLoginInput,
  validateUserPasswordInput,
  validateUserSignUpInput,
  validateUserEmailInput,
};
