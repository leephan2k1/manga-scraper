import Router from 'express-promise-router';
import tmzzController from '../controllers/tmzz.controller';
const router = Router();

/*
/tmzz/new
*/
router.route('/new').get(tmzzController().getNewManga);

/*
/tmzz/new-update
*/
router.route('/new-update').get(tmzzController().getNewMangaUpdated);

export default router;
