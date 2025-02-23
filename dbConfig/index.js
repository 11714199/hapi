const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', 'Madhavi@4', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres'
})

sequelize.authenticate().then(() => {
    console.log("Database connected....")
}).catch((err) => {
    console.log('Could not connected....', err)
})

module.exports = sequelize