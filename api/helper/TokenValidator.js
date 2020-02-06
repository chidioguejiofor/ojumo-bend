import jwt from 'jsonwebtoken';
import {
  MISSING_AUTH_REUQIREMENT, INVALID_TOKEN, NOT_ALLOWED, EXPIRED_TOKEN,
} from '~/api/utils/constants';

export default class TokenValidator {
  static validateTokenMiddleware(isAdmin = undefined) {
    return (req, resp, next) => {
      let auth = req.headers.authorization;
      if (!auth) {
        return resp.status(401).json({
          status: 'error',
          message: MISSING_AUTH_REUQIREMENT,
        });
      }
      auth = auth.split(' ');
      const [bearer, token] = auth;
      if (auth.length !== 2 || bearer !== 'Bearer') {
        return resp.status(401).json({
          status: 'error',
          message: INVALID_TOKEN,
        });
      }

      const tokenData = TokenValidator.decodeToken(token);

      if (!tokenData) {
        return resp.status(401).json({
          status: 'error',
          message: EXPIRED_TOKEN,
        });
      }
      if (isAdmin !== undefined && tokenData.isAdmin !== isAdmin) {
        return resp.status(401).json({
          status: 'error',
          message: NOT_ALLOWED,
        });
      }
      req.tokenData = tokenData;
      return next();
    };
  }

  static decodeToken(token) {
    try {
      return jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      return undefined;
    }
  }

  static createToken(tokenData, expiresIn) {
    console.log('tokenData', tokenData);
    return jwt.sign(tokenData, process.env.SECRET_KEY, {
      expiresIn,
    });
  }
}
