const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('data/database.sqlite');
db.run("DROP TABLE IF EXISTS wheel_settings", () => {
  console.log("Dropped wheel_settings");
});
