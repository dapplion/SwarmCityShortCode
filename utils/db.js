const wrapDb = require("../utils/wrapDb");
const db = wrapDb(require("level")(process.env.DB_PATH || "./db"));

module.exports = db;
