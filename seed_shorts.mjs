/**
 * One-time migration script: Insert all 390 Shorts quotes into the database.
 * Run with: node seed_shorts.mjs <path-to-shorts_cleaned.json>
 * (Historical note: originally run in the Manus sandbox against
 * /home/ubuntu/shorts_cleaned.json. The app now auto-seeds from
 * server/shortsSeedData.ts, so this script is normally unnecessary.)
 */
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const dataPath = process.argv[2];
if (!dataPath) {
  console.error('Usage: node seed_shorts.mjs <path-to-shorts_cleaned.json>');
  process.exit(1);
}

// Load the cleaned shorts data
const shortsData = JSON.parse(readFileSync(dataPath, 'utf-8'));
console.log(`Loaded ${shortsData.length} shorts quotes`);

const conn = await mysql.createConnection(dbUrl);

// Check current count
const [countRows] = await conn.execute('SELECT COUNT(*) as count FROM quotes');
console.log(`Current quote count: ${countRows[0].count}`);

// Check for existing video IDs to avoid duplicates
const [existingRows] = await conn.execute('SELECT videoUrl FROM quotes WHERE videoUrl IS NOT NULL');
const existingUrls = new Set(existingRows.map(r => r.videoUrl));
console.log(`Existing video URLs: ${existingUrls.size}`);

let inserted = 0;
let skipped = 0;

for (const q of shortsData) {
  const videoUrl = `https://www.youtube.com/shorts/${q.video_id}`;
  const altUrl = `https://www.youtube.com/watch?v=${q.video_id}`;
  
  // Skip if already exists
  if (existingUrls.has(videoUrl) || existingUrls.has(altUrl)) {
    skipped++;
    continue;
  }
  
  const topic = (q.topic || 'life advice').toLowerCase();
  const text = q.advice || '';
  const speakerName = q.speaker || 'Unknown';
  const videoTitle = q.video_title || '';
  
  if (!text || text.length < 10) {
    skipped++;
    continue;
  }
  
  try {
    await conn.execute(
      'INSERT INTO quotes (text, speakerName, videoUrl, videoTitle, topic, source, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [text, speakerName, videoUrl, videoTitle, topic, 'School of Hard Knocks', 0]
    );
    inserted++;
  } catch (err) {
    console.error(`Failed to insert ${q.video_id}: ${err.message}`);
    skipped++;
  }
}

// Final count
const [finalRows] = await conn.execute('SELECT COUNT(*) as count FROM quotes');
console.log(`\nDone!`);
console.log(`Inserted: ${inserted}`);
console.log(`Skipped: ${skipped}`);
console.log(`Total quotes now: ${finalRows[0].count}`);

await conn.end();
