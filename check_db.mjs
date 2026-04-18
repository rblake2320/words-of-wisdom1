import mysql from 'mysql2/promise';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set in environment');
  process.exit(1);
}

const conn = await mysql.createConnection(dbUrl);
const [rows] = await conn.execute('SELECT COUNT(*) as count FROM quotes');
console.log('Quote count:', rows[0].count);

const [seedRows] = await conn.execute('SELECT * FROM seed_flags LIMIT 5');
console.log('Seed flags:', seedRows);

await conn.end();
