const { Pool } = require("pg");
const DBConfig = require("./config");

const pool = new Pool(DBConfig);

module.exports = pool;
