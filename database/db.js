
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./books.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("SQLite database connected");
    }
});

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            price REAL NOT NULL
        )
    `);

    // Display database row count
    db.get("SELECT COUNT(*) AS total FROM books", (err, row) => {
        if (err) {
            console.error("Error counting books:", err.message);
        } else {
            console.log("Total Books in Database:", row.total);
        }
    });
});

module.exports = db;
