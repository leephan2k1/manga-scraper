const recentlyRoute = require('./recently');

function route(app) {
    const src = 'nt';

    app.use(`/${src}/recently`, recentlyRoute);
}

module.exports = route;
