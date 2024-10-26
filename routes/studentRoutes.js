import  { Router } from 'express'
import { updatePassport, submitOyshia } from '../controllers/student.js';


const router = Router();


router.patch('/updatePassport', updatePassport);
router.patch('/submitOyshia', submitOyshia);

export default router