'use strict';

const Raven = require('raven');


exports.register = (server, options, next) => {

    const dsn = options.dsn;
    const client = new Raven.Client(dsn, options.client);

    if (options.patchGlobal) {
        client.patchGlobal();
    }

    server.expose('raven', client);

    server.on('request-error', (request, err) => {

        client.captureError(err, {
            extra: {
                timestamp: request.info.received,
                id: request.id,
                method: request.method,
                path: request.path,
                query: request.query,
                remoteAddress: request.info.remoteAddress,
                userAgent: request.raw.req.headers['user-agent']
            }
        });
    });

    return next();
};


exports.register.attributes = {
    name: 'raven',
    version: require('../package.json').version
};
