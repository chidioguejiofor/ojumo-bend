import { format } from 'util';
import { body, check, validationResult, param, query } from 'express-validator';
import {
  NOT_EMPTY_MSG,
  NOT_A_VALID_EMAIL,
  SHOULD_BE_URL,
  INVALID_LENGTH,
  IS_NOT_EMAIL
} from '~/api/utils/constants';

export default class InputValidator {
  static validate(method) {
    return [
      this[method](),

      (req, resp, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return resp.status(422).json({ errors: errors.array() });
        }
        return next();
      }
    ];
  }

  static signup() {
    return [
      check('name')
        .notEmpty()
        .isLength({ min: 2 }),
      check('password').isLength({ min: 7 }),
      check('email').isEmail()
    ];
  }

  static adminLogin() {
    return [
      body('email', 'Invalid email')
        .exists()
        .isEmail(),
      body('password', format(NOT_EMPTY_MSG, 'password')).notEmpty()
    ];
  }

  static forgotPassword() {
    return [
      body('email', IS_NOT_EMAIL).isEmail(),
      body('redirectUrl', format(NOT_EMPTY_MSG, 'redirectUrl')).notEmpty(),
      body('redirectUrl', format(SHOULD_BE_URL, 'redirectUrl')).isURL()
    ];
  }

  static resetPassword() {
    return [
      body('password', format(INVALID_LENGTH, 'password', 7)).isLength({
        min: 7
      }),
      body(
        'confirmPassword',
        format(INVALID_LENGTH, 'confirmPassword', 7)
      ).isLength({
        min: 7
      }),
      body('password', format(NOT_EMPTY_MSG, 'password')).notEmpty(),
      body(
        'confirmPassword',
        format(NOT_EMPTY_MSG, 'comfirmPassword')
      ).notEmpty(),
      body('reset_id', format(NOT_EMPTY_MSG, 'reset_id')).notEmpty()
    ];
  }

  static validatePassToken() {
    return [
      query('redirectUrl', format(NOT_EMPTY_MSG, 'redirectUrl')).notEmpty(),
      query('redirectUrl', format(SHOULD_BE_URL, 'redirectUrl')).isURL(),
      query('token', format(NOT_EMPTY_MSG, 'token')).notEmpty()
    ];
  }

  static createArticle() {
    return [
      body('title', format(NOT_EMPTY_MSG, 'title')).notEmpty(),
      body('body', format(NOT_EMPTY_MSG, 'body')).notEmpty(),
      body('coverImage', format(NOT_EMPTY_MSG, 'coverImage')).notEmpty(),
      body('description', format(NOT_EMPTY_MSG, 'description')).notEmpty()
    ];
  }

  static addEvent() {
    return [
      body('name', format(NOT_EMPTY_MSG, 'name')).notEmpty(),
      body('speaker', format(NOT_EMPTY_MSG, 'speaker')).notEmpty(),
      body('eventDateTime', 'should be an ISO Datetime')
        .notEmpty()
        .isISO8601()
        .toDate()
    ];
  }

  static rsvp() {
    return [
      body('firstName', format(NOT_EMPTY_MSG, 'firstName')).notEmpty(),
      body('lastName', format(NOT_EMPTY_MSG, 'lastName')).notEmpty(),
      body('email', NOT_A_VALID_EMAIL)
        .notEmpty()
        .isEmail(),
      body('phoneNumber', format(NOT_EMPTY_MSG, 'phoneNumber')).notEmpty()
    ];
  }
}
