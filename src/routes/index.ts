import { Express } from 'express';
import lhRoutes from './lh.routes';
import ntRoutes from './nt.routes';
import notifyRoutes from './notify.routes';
import proxyController from '../controllers/proxy.controller';

function route(app: Express) {
    const src_1 = 'nt';
    const src_2 = 'lh';

    app.use(`/api/${src_1}`, ntRoutes);

    app.use(`/api/${src_2}`, lhRoutes);

    app.use('/api/proxy', proxyController().corsAnywhere);

    app.use('/api/notify', notifyRoutes);
}

export default route;
