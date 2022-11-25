const Sequelize = require('sequelize');

const DB = 'v2';
const USER = 'root';
const PASSWORD = '';

const sequelize = new Sequelize( DB, USER, PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    // pool configuration used to pool database connections
    pool: {
        max: 5,
        min: 0,
        idle: 30000,
        acquire: 60000,
    },
});

//let pool = mysql.createPool(sequelize);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// connecting models to DB
db.comments = require('../models/CommentModel.js')(sequelize, Sequelize);
db.replies = require('../models/ReplyModel.js')(sequelize, Sequelize);

module.exports = db;