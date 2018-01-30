'use strict';

const Raven = require('raven');

module.exports = {
    pkg: require('../package.json'),
    register: (server, options) => {

        Raven.config(options.dsn, options.client);

        if (options.patchGlobal) {
            Raven.install((err, sendErr, eventId) => {

                /* $lab:coverage:off$ */
                console.error(err.stack);
                process.exit(1);
                /* $lab:coverage:on$ */
            });
        }

        server.expose('raven', Raven);
        server.events.on('request', (request, err) => {

            /* $lab:coverage:off$ */
            const baseUrl = request.info.uri ||
                request.info.host && `${server.info.protocol}://${request.info.host}` ||
                server.info.uri;
            /* $lab:coverage:on$ */

            Raven.captureException(err, {
                request: {
                    method: request.method,
                    query_string: request.query,
                    headers: request.headers,
                    cookies: request.state,
                    url: `${baseUrl}${request.path}`
                },
                extra: {
                    timestamp: request.info.received,
                    id: request.id,
                    remoteAddress: request.info.remoteAddress
                },
                tags: options.tags
            });
        });
    }
};
