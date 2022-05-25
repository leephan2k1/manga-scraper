import Router from 'express-promise-router';
import ntController from '../controllers/nt.controller';
const router = Router();

/*
/nt/search
*/
router.route('/search').get(ntController().search);

/*
/nt/manga
*/
router.route('/manga/:mangaSlug').get(ntController().getManga);

/*
/nt/new
*/
router.route('/new').get(ntController().getNewManga);

/*
/nt/completed
*/
router.route('/completed').get(ntController().getCompletedManga);

export default router;
