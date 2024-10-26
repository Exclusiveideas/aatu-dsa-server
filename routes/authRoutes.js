import  { Router } from 'express'
import { loginUser, registerUser, resetPassword } from '../controllers/auth.js';

const router = Router()

router.post('/login', loginUser);
router.post('/register', registerUser);
router.patch('/resetPass', resetPassword);

export default router
