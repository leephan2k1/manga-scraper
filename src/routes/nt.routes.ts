import Router from 'express-promise-router';
import ntController from '../controllers/nt.controller';
const router = Router();

/*
/nt/completed
*/
router.route('/completed').get(ntController().getCompletedManga);

export default router;
