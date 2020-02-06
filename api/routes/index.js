import { Router } from 'express';
import User from '../controllers/user';
import Article from '../controllers/articles';
import InputValidator from '~/api/helper/InputValidator';
import TokenValidator from '~/api/helper/TokenValidator';

const router = Router();

router.get('/', (req, resp) => resp.status(200).json({
  message: 'Here we go!!',
}));

router.post('/admin/login', InputValidator.validate('adminLogin'), User.adminLogin);

// To aid testing by creating a user to have a hashed password
router.post('/admin/signup',
  InputValidator.validate('signup'), User.createUser);

router.post('/articles', TokenValidator.validateTokenMiddleware(true),
  InputValidator.validate('createArticle'), Article.createArticle);
export default router;
