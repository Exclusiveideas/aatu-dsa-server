import  { Router } from 'express'
import { updatePassport, submitOyshia, fetchStudent } from '../controllers/student.js';


const router = Router();


router.patch('/updatePassport', updatePassport);
router.patch('/submitOyshia', submitOyshia);
router.get('/fetchStudent', fetchStudent);

export default router