const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database("collection.sqlite", (err) => {
  if (err) console.error("Failed to connect:", err.message);
  else console.log("Connected to SQLite database!");
});

db.configure("busyTimeout", 5000); // wait up to 5 seconds

module.exports = db;