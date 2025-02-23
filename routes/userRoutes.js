const userService = require('../services/userService');

const userRoute = [
    {
        method: 'GET',
        path: '/getUsers',
        handler: async (request, h) => {
            try {
                let users = await userService.getUserData();
                return h.response(users).code(200);
            } catch (error) {
                console.error('Error in getUsers route:', error);
                return h.response({ error: 'Failed to fetch users' }).code(500);
            }
        }
    }
];

module.exports = userRoute;
