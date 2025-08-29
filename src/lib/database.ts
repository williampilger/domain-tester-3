import bcrypt from 'bcryptjs';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const dbPath = path.join(process.cwd(), 'data', 'domain_tester.db');

export async function getDatabase() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Criar tabelas se não existirem
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS domain_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      domain TEXT NOT NULL,
      port INTEGER,
      test_type TEXT NOT NULL,
      results TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS stress_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      domain TEXT NOT NULL,
      port INTEGER,
      concurrent_users INTEGER NOT NULL,
      duration_seconds INTEGER NOT NULL,
      results TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

  // Criar usuário padrão se não existir
  const existingAdmin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@domaintester.local', hashedPassword, 1]
    );
  }

  return db;
}

export async function createUser(username: string, email: string, password: string, isAdmin = false) {
  const db = await getDatabase();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const result = await db.run(
      'INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, isAdmin ? 1 : 0]
    );
    return { success: true, userId: result.lastID };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function authenticateUser(username: string, password: string) {
  const db = await getDatabase();
  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.is_admin === 1
  };
}

export async function saveDomainTest(userId: number, domain: string, port: number | null, testType: string, results: any) {
  const db = await getDatabase();
  await db.run(
    'INSERT INTO domain_tests (user_id, domain, port, test_type, results) VALUES (?, ?, ?, ?, ?)',
    [userId, domain, port, testType, JSON.stringify(results)]
  );
}

export async function saveStressTest(userId: number, domain: string, port: number | null, concurrentUsers: number, durationSeconds: number, results: any, status: string) {
  const db = await getDatabase();
  await db.run(
    'INSERT INTO stress_tests (user_id, domain, port, concurrent_users, duration_seconds, results, status, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, domain, port, concurrentUsers, durationSeconds, JSON.stringify(results), status, status === 'completed' ? new Date().toISOString() : null]
  );
}

export async function getUserTests(userId: number, limit = 50) {
  const db = await getDatabase();
  return await db.all(
    'SELECT * FROM domain_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
}

export async function getUserStressTests(userId: number, limit = 50) {
  const db = await getDatabase();
  return await db.all(
    'SELECT * FROM stress_tests WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
}
