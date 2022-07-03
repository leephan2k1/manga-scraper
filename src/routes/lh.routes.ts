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
/lh/chapter
*/
router
    .route('/chapter/:mangaSlug/:chapter/:chapterId')
    .get(lhController().getChapters);

export default router;
