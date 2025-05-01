const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new sqlite3.Database(path.join(dbDir, 'laurent_agency.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// Read and execute schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema, (err) => {
    if (err) {
        console.error('Error creating tables:', err);
    } else {
        console.log('Database tables created successfully.');
    }
});

// Close database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('Database connection closed.');
    }
}); 