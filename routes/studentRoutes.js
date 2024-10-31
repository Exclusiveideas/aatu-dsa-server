import { Router } from 'express';
import { updatePassport, submitOyshia, fetchStudent, allocateRoom } from '../controllers/student.js';


const router = Router();


router.patch('/updatePassport', updatePassport);
router.patch('/submitOyshia', submitOyshia);
router.get('/fetchStudent', fetchStudent);
router.patch('/allocateRoom', allocateRoom);

export default router