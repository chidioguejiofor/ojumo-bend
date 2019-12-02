import { Router } from 'express';
import user  from '../controllers/user';
import inputValidator from '../helper/inputValidator';

const router = Router();

router.get('/', (req, resp)=>{
    return resp.status(200).json({
        message: 'Here we go!!',
    })
})

router.post('/admin/login', inputValidator.validate('adminLogin'), user.adminLogin)

// To aid testing by creating a user to have a hashed password
router.post('/admin/signup', user.createUser);
export default router;
