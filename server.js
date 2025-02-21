'use strict'

const Hapi = require('@hapi/hapi');
const path = require('path')

const init = async () => {
    const server = Hapi.Server({
        host: 'localhost',
        port: 1234,
        routes: {
            files: {
                relativeTo: path.join(__dirname, 'static')
            }
        }
    })

    /***A plugin is basically additional functionality added to your app
     * For example a plugin for adding login functionality,one for working with db 
     */
    await server.register([
        {
            plugin: require('hapi-geo-locate'),
            options: {
                enabledByDefault: true
            }
        },
        {
            plugin: require('@hapi/inert'),
        }
    ])

    server.route([{
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            /**
             * Request created internally for each incoming request
            request.auth: contains authentication details
            request.query: each key in a query parameter
            requesr.path: the request URIs pathname 
             */
            /**
             * h.authenticated(data): used to handle valid credentials
             * h.redirect(url): redirect the client to the specific url
             * h.responce([value]): return the responce
             */
            return 'Hell World'
        }
    },
    {
        method: 'GET',
        path: '/users/{name?}',
        handler: (request, h) => {
            if (request.params.name) {
                return `Hello ${request.params.name}`
            } else if (request.query.first_name && request.query.last_name) {
                return `Hello ${request.query.first_name} ${request.query.last_name}`
            } else {
                return h.redirect('/')
            }
        }
    },
    {
        method: 'GET',
        path: '/{any*}',
        handler: (request, h) => {
            return h.redirect('/')
        }
    },
    {
        method: 'GET',
        path: '/location',
        handler: (request, h) => {
            console.log(request)
            if (request.location) {
                return request.location
            } else {
                return `Location not enabled`
            }
        }
    },
    {
        method: 'GET',
        path: '/file',
        handler: (request, h) => {
            return h.file('welcome.html')
        }
    }
    ])

    // server.route({
    //     method: 'GET',
    //     path: '/users/{name?}',
    //     handler: (request, h) => {
    //         if(request.params.name) {
    //             return `Hello ${request.params.name}`
    //         } else if(request.query.first_name && request.query.last_name) {
    //             return `Hello ${request.query.first_name} ${request.query.last_name}`
    //         } else {
    //             return h.redirect('/')
    //         }
    //     }
    // })

    // server.route({
    //     method: 'GET',
    //     path: '/{any*}',
    //     handler: (request, h) => {
    //         return h.redirect('/')
    //     }
    // })

    await server.start();
    console.log(server.info)
    console.log(`Server started on: ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1)
})

init()