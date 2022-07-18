import Router from 'express-promise-router';
import webPushController from '../controllers/webPush.controller';
const router = Router();

// /notify/info
router.route('/info').post(webPushController().info);

// /notify/subscribe
router.route('/subscribe').post(webPushController().subscribe);

// /notify/unsubscribe
router.route('/unsubscribe').delete(webPushController().unsubscribe);

// /notify/update
router.route('/update').get(webPushController().update);

export default router;
