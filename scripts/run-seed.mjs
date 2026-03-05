import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new pg.Client({
  host: 'db.jnbgbsprmxfkwgokmgtw.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('Connecting to Supabase database...');
  await client.connect();
  console.log('Connected!\n');

  const sql = readFileSync(join(__dirname, 'seed-data.sql'), 'utf-8');

  console.log('Running seed SQL (101 trails, 52 businesses, 56 reviews, 20 posts)...');
  console.log('This may take a moment...\n');

  try {
    await client.query(sql);
    console.log('✅ Seed completed successfully!\n');

    // Verify counts
    const trails = await client.query('SELECT COUNT(*) FROM trails');
    const businesses = await client.query('SELECT COUNT(*) FROM businesses');
    const reviews = await client.query('SELECT COUNT(*) FROM reviews');
    const posts = await client.query('SELECT COUNT(*) FROM activity_posts');

    console.log('Database now contains:');
    console.log(`  🥾 ${trails.rows[0].count} trails`);
    console.log(`  🏪 ${businesses.rows[0].count} businesses`);
    console.log(`  ⭐ ${reviews.rows[0].count} reviews`);
    console.log(`  📋 ${posts.rows[0].count} activity posts`);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    if (err.message.includes('already exists') || err.message.includes('duplicate')) {
      console.log('\nLooks like data already exists. Try clearing first or it may be partially seeded.');
    }
    if (err.detail) console.error('Detail:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
  }

  await client.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
