const fs = require("fs");
const { LOG_FILE } = require("../config");

const log = (message) => {
  console.log(message);
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - ${message}\n`);
};

module.exports = { log };
