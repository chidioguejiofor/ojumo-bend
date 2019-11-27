import {Router} from 'express';

const router = Router();

router.get('/', (req, resp)=>{
    return resp.status(200).json({
        message: 'Here we go!!',
    })
})
export default router;
