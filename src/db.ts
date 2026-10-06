import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', 'data.db');
export const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    equipmentId TEXT NOT NULL,
    borrowerName TEXT NOT NULL,
    startAt TEXT NOT NULL,
    endAt TEXT NOT NULL,
    purpose TEXT NOT NULL,
    FOREIGN KEY (equipmentId) REFERENCES equipment (id)
  );
`);

// Seed initial data if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM equipment');
const result = countStmt.get() as { count: number };
if (result.count === 0) {
  const insertEquipment = db.prepare('INSERT INTO equipment (id, name, location) VALUES (?, ?, ?)');
  insertEquipment.run('eq-1', 'Projector A', 'Building 1');
  insertEquipment.run('eq-2', 'Camera X', 'Building 2');
}
