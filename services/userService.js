const Users = require('../models/users');

async function getUserData() {
    try {
        let users = await Users.findAll();
        console.log(users);
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

module.exports = { getUserData };
