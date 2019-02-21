const fs = require("fs");
const path = require("path");

/**
 * Test utility to clean a folder's content syncronously with fs
 * @param {String} directory
 */
const directory = process.argv[2] || "./db";
console.log(`Removing db contents at directory ${directory}`);

const files = fs.readdirSync(directory);
for (const file of files) {
  fs.unlinkSync(path.join(directory, file));
}
