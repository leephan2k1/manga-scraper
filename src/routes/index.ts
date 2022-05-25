import { Express } from 'express';
import tmzzRoutes from './tmzz.routes';
import ntRoutes from './nt.routes';

function route(app: Express) {
    const src_1 = 'nt';
    const src_2 = 'lh';
    const src_3 = 'tmzz';

    app.use(`/api/${src_1}`, ntRoutes);

    app.use(`/api/${src_3}`, tmzzRoutes);
}

export default route;
