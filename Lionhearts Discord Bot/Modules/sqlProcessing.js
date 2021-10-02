const SQL = require('mysql');

module.exports = SQL.createPool({ //creates a pool of connections that can occur simultaneously
    connectionLimit : process.env.SQL_CONNECTIONLIMIT,
    host : `${process.env.SQL_HOST}`,
    port : `${process.env.SQL_PORT}`,
    user : `${process.env.SQL_USER}`,
    password : `${process.env.SQL_PASSWORD}`,
    database : `${process.env.SQL_DATABASE}`,
});
