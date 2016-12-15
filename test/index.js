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


it('registers with the dsn and client options', (done) => {

    const server = new Hapi.Server();
    server.connection();

    const plugins = {
        register: Plugin,
        options: {
            dsn: 'https://public:private@app.getsentry.com/269dsn',
            patchGlobal: true,
            client: { foo: 'bar' }
        }
    };

    server.register(plugins, (err) => {

        expect(err).to.not.exist();
        const client = server.plugins.raven;
        expect(client).to.be.an.object();
        expect(client.raven.raw_dsn).to.equal('https://public:private@app.getsentry.com/269dsn');
        expect(client.raven.installed).to.be.true();
        return done();
    });
});


it('captures a request-error', (done) => {

    const server = new Hapi.Server();
    server.connection();

    const plugins = {
        register: Plugin,
        options: {
            dsn: 'https://public:private@app.getsentry.com/269dsn',
            client: {}
        }
    };

    server.register(plugins, (err) => {

        expect(err).to.not.exist();
        server.route({
            method: 'GET',
            path: '/',
            handler: (request, reply) => reply(new Error())
        });

        server.inject('/', () => {

            return done();
        });
    });
});
