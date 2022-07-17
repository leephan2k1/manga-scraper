import Router from 'express-promise-router';
import webPushController from '../controllers/webPush.controller';
const router = Router();

// /notify/subscribe
router.route('/subscribe').post(webPushController().subscribe);

// /notify/update
router.route('/update').get(webPushController().update);

export default router;
