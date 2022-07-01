import Router from 'express-promise-router';
import tmzzController from '../controllers/lh.controller';
const router = Router();

/*
/lh/search
*/
router.route('/search').get(tmzzController().searchManga);

/*
/lh/manga
*/
router.route('/manga/:mangaSlug').get(tmzzController().getManga);

export default router;
