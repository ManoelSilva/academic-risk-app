const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'academic_risk.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + dbPath + ': ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            registrationNumber TEXT UNIQUE NOT NULL,
            course TEXT,
            academicYear INTEGER,
            gpa REAL,
            attendancePercentage REAL,
            inde REAL,
            iaa REAL,
            ieg REAL,
            ips REAL,
            ida REAL,
            ipp REAL,
            ipv REAL,
            ian REAL,
            defasagem INTEGER,
            idadeAluno INTEGER,
            anosPm INTEGER,
            pedra TEXT,
            pontoVirada TEXT,
            sinalizadorIngressante TEXT,
            riskScore REAL,
            riskProbability REAL,
            riskLabel TEXT,
            riskEvaluatedAt TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
            )`,
    (err) => {
        if (err) {
            console.error('Error creating table: ' + err.message);
        }
        ['riskScore REAL', 'riskProbability REAL', 'riskLabel TEXT', 'riskEvaluatedAt TEXT'].forEach(col => {
            const name = col.split(' ')[0];
            db.run(`ALTER TABLE students ADD COLUMN ${col}`, () => {});
        });
    });
  }
});

module.exports = db;
