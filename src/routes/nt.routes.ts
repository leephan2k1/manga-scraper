import Router from 'express-promise-router';
import ntController from '../controllers/nt.controller';
const router = Router();

/*
/nt/search
*/
router.route('/search').get(ntController().search);

/*
/nt/search
*/
router.route('/advanced-search').get(ntController().advancedSearch);

/*
/nt/author
*/
router.route('/author').get(ntController().getMangaAuthor);

/*
/nt/filters
*/
router.route('/filters').get(ntController().filtersManga);

/*
/nt/ranking
*/
router.route('/ranking').get(ntController().getRanking);

/*
/nt/manga
*/
router.route('/manga/:mangaSlug').get(ntController().getManga);

/*
/nt/chapter
*/
router
    .route('/chapter/:mangaSlug/:chapter/:chapterId')
    .get(ntController().getChapter);

/*
/nt/new
*/
router.route('/new').get(ntController().getNewManga);

/*
/nt/new-updated
*/
router.route('/new-updated').get(ntController().getNewUpdatedManga);

/*
/nt/completed
*/
router.route('/completed').get(ntController().getCompletedManga);

/*
this route just test!
/nt/test
*/
// router.route('/test').get(ntController().testRoute);

export default router;
