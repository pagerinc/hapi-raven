'use strict';

// Load modules

const Lab = require('lab');
const Code = require('code');

const Boom = require('boom');
const Hapi = require('hapi');
const Raven = require('raven');
const Sinon = require('sinon');
const Plugin = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const it = lab.it;
const expect = Code.expect;


it('registers with the dsn and client options', (done) => {

    const server = new Hapi.Server();
    server.connection();

    Sinon.stub(Raven, 'Client', (opts) => {

        expect(opts).to.deep.equal('dsn');

        return {
            patchGlobal: (options) => expect(options).to.not.exist()
        };
    });

    const plugins = {
        register: Plugin,
        options: {
            dsn: 'dsn',
            patchGlobal: true,
            client: Raven
        }
    };

    server.register(plugins, (err) => {

        expect(err).to.not.exist();
        Raven.Client.restore();
        return done();
    });
});


it('captures a request-error', (done) => {

    Sinon.stub(Raven, 'Client', (opts) => {

        return {
            captureError: function (error, params) {

                return {
                    timestamp: Sinon.match.number,
                    id: Sinon.match.string,
                    method: 'get',
                    path: '/',
                    query: {},
                    remoteAddress: '127.0.0.1',
                    userAgent: 'shot'
                };
            }
        };
    });

    const server = new Hapi.Server();
    server.connection();

    const plugins = {
        register: Plugin,
        options: {
            dsn: 'dsn',
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

            Raven.Client.restore();
            return done();
        });
    });
});


it('does not capture Boom errors', (done) => {

    Sinon.stub(Raven, 'Client', (opts) => {

        return {
            captureError: () => {

                throw new Error('shouldn\'t have been called!');
            }
        };
    });

    const server = new Hapi.Server();
    server.connection();

    const plugins = {
        register: Plugin,
        options: {
            dsn: 'dsn',
            client: {}
        }
    };

    server.register(plugins, (err) => {

        expect(err).to.not.exist();

        server.route({
            method: 'GET',
            path: '/boom',
            handler: (request, reply) => reply(Boom.forbidden())
        });

        server.inject('/boom', () => {

            Raven.Client.restore();
            return done();
        });
    });
});
