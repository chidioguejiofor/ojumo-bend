import { format } from 'util';
import { body, check, validationResult } from 'express-validator';
import { NOT_EMPTY_MSG } from '~/api/utils/constants';

export default class InputValidator {
  static validate(method) {
    return [this[method](),

      (req, resp, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return resp.status(422).json({ errors: errors.array() });
        }
        return next();
      }];
  }

  static signup() {
    return [
      check('name').notEmpty().isLength({ min: 2 }),
      check('password').isLength({ min: 7 }),
      check('email').isEmail(),
    ];
  }

  static adminLogin() {
    return [
      body('email', 'Invalid email').exists().isEmail(),
      body('password', format(NOT_EMPTY_MSG, 'password')).notEmpty(),
    ];
  }

  static createArticle() {
    return [
      body('title', format(NOT_EMPTY_MSG, 'title')).notEmpty(),
      body('body', format(NOT_EMPTY_MSG, 'body')).notEmpty(),
      body('coverImage', format(NOT_EMPTY_MSG, 'coverImage')).notEmpty(),
      body('description', format(NOT_EMPTY_MSG, 'description')).notEmpty(),
    ];
  }
}
