const pg = require("pg");
const DBConfig = require("./config");

console.log(DBConfig);

const client = new pg.Client(DBConfig);

module.exports = client;
