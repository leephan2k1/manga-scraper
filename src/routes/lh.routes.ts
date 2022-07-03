import Router from 'express-promise-router';
import lhController from '../controllers/lh.controller';
const router = Router();

/*
/lh/search
*/
router.route('/search').get(lhController().searchManga);

/*
/lh/manga
*/
router.route('/manga/:mangaSlug').get(lhController().getManga);

/*
/lh/chapters
*/
router.route('/chapters/:mangaSlug/:chapterId').get(lhController().getChapters);

export default router;
