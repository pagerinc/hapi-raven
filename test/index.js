'use strict';

// Load modules

const Lab = require('lab');
const Code = require('code');

const Hapi = require('hapi');
const Plugin = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const it = lab.it;


it('registers with the dsn and client options', async () => {

    const server = await new Hapi.Server();

    await server.register({
        plugin: Plugin,
        options: {
            dsn: 'https://public:private@app.getsentry.com/269dsn',
            patchGlobal: true,
            client: { foo: 'bar' }
        }
    });

    const client = server.plugins[process.env.npm_package_name];
    expect(client).to.be.an.object();
    expect(client.raven.raw_dsn).to.equal('https://public:private@app.getsentry.com/269dsn');
    expect(client.raven.installed).to.be.true();
});


it('captures a request-error', async () => {

    const server = await new Hapi.Server();

    await server.register({
        plugin: Plugin,
        options: {
            dsn: 'https://public:private@app.getsentry.com/269dsn',
            client: { }
        }
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, reply) => {

            throw new Error();
        }
    });

    await server.inject('/');
});
