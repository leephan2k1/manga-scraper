import Router from 'express-promise-router';
import ntController from '../controllers/nt.controller';
const router = Router();

/*
/nt/search
*/
router.route('/search').get(ntController().search);

/*
/nt/author
*/
router.route('/author').get(ntController().getMangaAuthor);

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
/nt/completed
*/
router.route('/completed').get(ntController().getCompletedManga);

export default router;
