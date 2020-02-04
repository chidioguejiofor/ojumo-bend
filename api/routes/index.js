import { Router } from 'express';
import User from '../controllers/user';
import inputValidator from '../helper/inputValidator';

const router = Router();

router.get('/', (req, resp) => resp.status(200).json({
  message: 'Here we go!!',
}));

router.post('/admin/login', inputValidator.validate('adminLogin'), User.adminLogin);

// To aid testing by creating a user to have a hashed password
router.post('/admin/signup',
  inputValidator.validate('signup'), User.createUser);
export default router;
