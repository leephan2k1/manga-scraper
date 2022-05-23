import Router from 'express-promise-router';
import getRecentlyTmzz from '../controllers/tmzzControllers/recently.controller';
const router = Router();

/*
/tmzz/recently
*/
router.route('/recently').get(getRecentlyTmzz);

export default router;
