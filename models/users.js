const { DataTypes } = require('sequelize');
const db = require('../dbConfig');

const users = db.define('users', {
    username: {
        type: DataTypes.STRING,
        allownull: false
    },
    password: {
        type: DataTypes.STRING,
        allownull: false
    }
}, {
    freezeTableName: true,
    timestamps: false
})
users.sync()
module.exports = users