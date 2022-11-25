const Sequelize = require('sequelize');

const DB = 'mvp_v1';
const USER = 'root';
const PASSWORD = '';

const sequelize = new Sequelize( DB, USER, PASSWORD, {
    host: 'localhost',
    dialect: 'mysql'
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// connecting models to DB
db.comments = require('../models/CommentModel.js')(sequelize, Sequelize);

module.exports = db;