import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'labsync.db')

// Ensure data directory exists
const dbDir = path.dirname(dbPath)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export function initDb(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email       TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS lab_reports (
      id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      report_date     TEXT NOT NULL,
      source_filename TEXT,
      raw_text        TEXT,
      storage_path    TEXT,
      created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_lab_reports_user ON lab_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_lab_reports_date ON lab_reports(report_date);

    CREATE TABLE IF NOT EXISTS biomarkers (
      id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      report_id       TEXT NOT NULL REFERENCES lab_reports(id) ON DELETE CASCADE,
      user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name            TEXT NOT NULL,
      value           REAL,
      value_text      TEXT,
      unit            TEXT,
      reference_min   REAL,
      reference_max   REAL,
      reference_text  TEXT,
      status          TEXT NOT NULL DEFAULT 'unknown',
      category        TEXT,
      created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_biomarkers_user ON biomarkers(user_id);
    CREATE INDEX IF NOT EXISTS idx_biomarkers_report ON biomarkers(report_id);

    CREATE TABLE IF NOT EXISTS appointments (
      id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type      TEXT NOT NULL,
      specialty TEXT NOT NULL,
      date      TEXT NOT NULL,
      time      TEXT,
      notes     TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);

    CREATE TABLE IF NOT EXISTS medicines (
      id                    TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name                  TEXT NOT NULL,
      start_date            TEXT NOT NULL,
      end_date              TEXT,
      pills_per_dose        INTEGER NOT NULL DEFAULT 1,
      times_per_day         INTEGER NOT NULL DEFAULT 1,
      prescription_required INTEGER NOT NULL DEFAULT 0,
      bought_on             TEXT,
      pills_bought          INTEGER,
      schedule              TEXT,
      notes                 TEXT,
      created_at            TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );

    CREATE INDEX IF NOT EXISTS idx_medicines_user ON medicines(user_id);
  `)
}

export default db
