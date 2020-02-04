import { body, check } from 'express-validator';

const inputValidator = {
  validate: (method) => {
    switch (method) {
      case 'adminLogin': {
        return [
          body('email', 'Invalid email').exists().isEmail(),
          body('password', 'Password field should not be empty').notEmpty(),
        ];
      }
      case 'signup': {
        return [
          check('name').notEmpty().isLength({ min: 2 }),
          check('password').isLength({ min: 7 }),
          check('email').isEmail(),
        ];
      }
      default:
        return null;
    }
  },
};

export default inputValidator;
