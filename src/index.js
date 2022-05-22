require('dotenv').config();
const express = require('express');
const cors = require('cors');
const route = require('./routes');
const createError = require('http-errors');

const app = express();
const port = app.get('port') || 5000;

//apply middleware
app.use(cors());
app.use(express.json());

//router
route(app);

//catch 404
app.use((req, res, next) => {
    next(createError(404, '404 Not Found!'));
});

//error handler
app.use((err, req, res, next) => {
    const error = app.get('env') === 'development' ? err : {};
    const status = err.status || 500;

    console.log(
        `${req.url} --- ${req.method} --- ${JSON.stringify({
            message: error.message,
        })}`,
    );
    return res.status(status).json({
        status,
        message: error.message,
    });
});

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});
