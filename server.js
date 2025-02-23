'use strict'

const Hapi = require('@hapi/hapi');
const path = require('path');
const db = require('./dbConfig')
const users = require('./models/users')
const Boom = require('@hapi/boom')
const hapijwt = require('@hapi/jwt')
const jwt = require('jsonwebtoken')
const userRoutes = require('./routes/userRoutes')

const validate = async (request, username, password, h) => {
    if (username == 'Madhavi', password == 'Madhavi@4') {
        return { isValid: true, credentials: { user: username, pass: password } }
    }
    return { isValid: false }
}

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
        },
        {
            plugin: require('@hapi/vision')
        },
        {
            plugin: require('@hapi/basic')
        },
        {
            plugin: hapijwt
        }
    ])

    server.auth.strategy('login', 'basic', { validate })

    server.auth.strategy('jwt', 'jwt', {
        keys: 'SECRET_KEY',
        verify: {
            aud: false, // Audience check
            iss: false, // Issuer check
            sub: false, // Subject check
            nbf: true, // Not before validation
            exp: true // Expiration check
        },
        validate: (artifacts, request, h) => {
            console.log(artifacts.decoded.payload.user)
            if(artifacts.decoded.payload.user) {
                return { isValid: true, credentials: artifacts.decoded.payload }
            } else {
                return { isValid: false }
            }
        }
    })

    //server.auth.default('jwt')
    server.route([...userRoutes])

    server.views({
        engines: {
            html: require('handlebars')
        },
        path: path.join(__dirname, 'views'),
       // layout: 'default'
    })
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
            return h.view('alpine.html')//'<h1>Hell World<h1>'
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
                return '<h1>Hello Stranger<h1>'//h.redirect('/')
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
    /************************* hapi-geo-locate *********************/
    {
        method: 'GET',
        path: '/location',
        handler: (request, h) => {
            console.log(request)
            if (request.location) {
                return request.location
            } else {
                return `<h1>Location not enabled<h1>`
            }
        }
    },
    /***************************** Inert pugin for static file ******************************/
    {
        method: 'GET',
        path: '/file',
        handler: (request, h) => {
            return h.file('welcome.html')
        }
    },
    {
        method: 'GET',
        path: '/download',
        handler: (request, h) => {
            return h.file('welcome.html', {
                mode: 'inline', /* attachment will download the file  */
                filename: 'welcome-file.html'
            })
        }
    },
    /*********************** Vision plugin for dynamic files need to install handlebars for template engines *****************/
    {
        method: 'POST',
        path: '/login',
        handler: (request, h) => {
            console.log(request.payload)
            return h.view('index', { name: request.payload.username })
        }
    },
    {
        method: 'GET',
        path: '/dynamic',
        handler: (request, h) => {
            return h.view('index', { name: "Madhavi" })
        }
    },
    /******************************** database ******************************/
    {
        method: 'POST',
        path: '/addUser',
        handler: async (request, h) => {
            try {
                await users.create({ username: request.payload.username, password: request.payload.password });
                return 'User added successfully'
            } catch (err) {
                return err;
            }
        }
    },
    // {
    //     method: 'GET',
    //     path: '/getUsers',
    //     handler: async (request, h) => {
    //         return await db.query(`SELECT * FROM public.users;`)
    //     }
    // },
    /**************************** Authentication Basic and Boom ******************************/
    {
        method: 'GET',
        path: '/loginBasic',
        options: {
            auth: 'login'
        },
        handler: (request, h) => {
            console.log(request.auth)
            return 'Welcome'
        }
    }, 
    {
        method: 'GET',
        path: '/logoutBasic',
        handler: (request, h) => {
            return Boom.unauthorized('Logged out successfuly')
        }
    },
    /******************************** JWT **************************/
    {
        method: 'POST',
        path: '/loginJwt',
        options: {
            auth: false
        },
        handler: (request, h) => {
            const token = jwt.sign({ user: request.payload.username }, 'SECRET_KEY', { expiresIn: '1h' });
            return { message: 'Login successful', token };
        }
    }
    ])

    await server.start();
    console.log(server.info)
    console.log(`Server started on: ${server.info.uri}`)
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1)
})

init()