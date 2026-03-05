import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_URL = 'https://jnbgbsprmxfkwgokmgtw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_USER_ID = 'd2ba13af-b2e9-41fe-9c8d-d0a3a3ff56d8';

if (!SERVICE_ROLE_KEY) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

async function api(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return { ok: false, error: await res.text() };
  return { ok: true };
}

async function query(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  return res.json();
}

async function getCount(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    method: 'HEAD', headers: { ...headers, 'Prefer': 'count=exact' },
  });
  return res.headers.get('content-range')?.split('/')[1] || '?';
}

async function main() {
  console.log('🌱 Seeding reviews, activity posts & region highlights\n');

  // Get all trails and businesses for linking
  const trails = await query('trails?select=id,slug,name,city&order=name');
  const businesses = await query('businesses?select=id,slug,name,city&order=name');

  console.log(`  Found ${trails.length} trails, ${businesses.length} businesses\n`);

  // Group trails by region
  const trailsByCity = {};
  for (const t of trails) {
    const city = t.city || 'Unknown';
    if (!trailsByCity[city]) trailsByCity[city] = [];
    trailsByCity[city].push(t);
  }

  const bizByCity = {};
  for (const b of businesses) {
    const city = b.city || 'Unknown';
    if (!bizByCity[city]) bizByCity[city] = [];
    bizByCity[city].push(b);
  }

  // ── REVIEWS ──
  console.log('  ⭐ Generating reviews...');
  const reviewTemplates = [
    { rating: 5, title: 'Absolutely incredible', body: 'One of the best trails I\'ve ever ridden. The scenery is breathtaking and the terrain keeps you on your toes the entire time.' },
    { rating: 5, title: 'Must-do trail', body: 'Lives up to the hype completely. Make sure you bring enough water and start early to avoid the heat.' },
    { rating: 4, title: 'Great experience', body: 'Really enjoyed this one. Well-maintained trail with beautiful views. Some sections are quite technical but manageable.' },
    { rating: 4, title: 'Fun and challenging', body: 'A solid trail with good variety. The elevation gains are no joke but the descents make it all worthwhile.' },
    { rating: 4, title: 'Highly recommend', body: 'Went with a group of friends and we all had a blast. The trail conditions were excellent.' },
    { rating: 3, title: 'Good but crowded', body: 'Nice trail but it gets very busy on weekends. Try to go on a weekday if possible for the best experience.' },
    { rating: 5, title: 'World class', body: 'Having ridden trails across Europe and North America, this is truly special. The combination of views and technical challenge is unmatched.' },
    { rating: 4, title: 'Solid day out', body: 'Well-marked trail with good signage. The shuttle service makes it really convenient. Would definitely come back.' },
    { rating: 5, title: 'Exceeded expectations', body: 'Heard great things and it still blew me away. The rock features are unlike anything else.' },
    { rating: 3, title: 'Decent but needs work', body: 'Some erosion issues on the lower sections. Still enjoyable overall but the trail could use some maintenance.' },
  ];

  const bizReviewTemplates = [
    { rating: 5, title: 'Best shop in town', body: 'Incredibly knowledgeable staff who helped me pick the perfect setup. Fair prices and great service.' },
    { rating: 5, title: 'Top notch service', body: 'Fixed my bike in under an hour and the mechanic explained everything. Will definitely be back.' },
    { rating: 4, title: 'Great selection', body: 'Good range of gear and rentals. The staff gave excellent trail recommendations too.' },
    { rating: 4, title: 'Reliable rentals', body: 'Bikes were in great condition and the pricing was fair. Pickup and dropoff was smooth.' },
    { rating: 5, title: 'Amazing experience', body: 'The guided tour was worth every penny. Our guide knew the trails inside and out and showed us hidden gems.' },
  ];

  // Clear existing reviews
  await fetch(`${SUPABASE_URL}/rest/v1/reviews?id=not.is.null`, { method: 'DELETE', headers });

  let reviewCount = 0;
  // Add 2-4 reviews per popular trail (first 3 trails in each city)
  for (const [city, cityTrails] of Object.entries(trailsByCity)) {
    const popular = cityTrails.slice(0, 3);
    for (const trail of popular) {
      const numReviews = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numReviews; i++) {
        const tmpl = reviewTemplates[(reviewCount + i) % reviewTemplates.length];
        const review = {
          author_id: SEED_USER_ID,
          entity_type: 'trail',
          entity_id: trail.id,
          rating: tmpl.rating,
          title: tmpl.title,
          body: tmpl.body,
          photos: [],
          is_verified: true,
          helpful_count: Math.floor(Math.random() * 20),
        };
        const r = await api('POST', 'reviews', review);
        if (r.ok) reviewCount++;
      }
    }
  }

  // Add 1-2 reviews per popular business
  for (const [city, cityBiz] of Object.entries(bizByCity)) {
    const popular = cityBiz.slice(0, 2);
    for (const biz of popular) {
      const numReviews = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numReviews; i++) {
        const tmpl = bizReviewTemplates[(reviewCount + i) % bizReviewTemplates.length];
        const review = {
          author_id: SEED_USER_ID,
          entity_type: 'business',
          entity_id: biz.id,
          rating: tmpl.rating,
          title: tmpl.title,
          body: tmpl.body,
          photos: [],
          is_verified: true,
          helpful_count: Math.floor(Math.random() * 15),
        };
        const r = await api('POST', 'reviews', review);
        if (r.ok) reviewCount++;
      }
    }
  }
  console.log(`    Inserted ${reviewCount} reviews ✅\n`);

  // ── ACTIVITY POSTS ──
  console.log('  📋 Generating activity posts...');
  await fetch(`${SUPABASE_URL}/rest/v1/activity_posts?id=not.is.null`, { method: 'DELETE', headers });

  const postTemplates = [
    { post_type: 'im_going', skill_level: 'intermediate', title_prefix: 'Morning ride at', desc_prefix: 'Heading out early to beat the heat. Looking for company on' },
    { post_type: 'lfg', skill_level: 'beginner', title_prefix: 'Beginners welcome at', desc_prefix: 'Relaxed pace ride, great for those new to the area. Meeting at trailhead for' },
    { post_type: 'lfg', skill_level: 'advanced', title_prefix: 'Technical session at', desc_prefix: 'Looking for experienced riders to push limits on' },
    { post_type: 'im_going', skill_level: 'expert', title_prefix: 'Full send at', desc_prefix: 'Going all out on the gnarliest lines at' },
    { post_type: 'lfg', skill_level: 'intermediate', title_prefix: 'Group ride:', desc_prefix: 'Organizing a group ride, all skill levels welcome. We\'ll be doing' },
  ];

  let postCount = 0;
  for (const [city, cityTrails] of Object.entries(trailsByCity)) {
    if (cityTrails.length === 0) continue;
    // 1-2 posts per city
    const numPosts = Math.min(2, cityTrails.length);
    for (let i = 0; i < numPosts; i++) {
      const trail = cityTrails[i];
      const tmpl = postTemplates[(postCount + i) % postTemplates.length];
      const daysAhead = 1 + Math.floor(Math.random() * 14);
      const actDate = new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0];

      const post = {
        user_id: SEED_USER_ID,
        post_type: tmpl.post_type,
        activity_type: trail.name?.toLowerCase().includes('hik') ? 'hiking' : 'mtb',
        title: `${tmpl.title_prefix} ${trail.name}`,
        description: `${tmpl.desc_prefix} ${trail.name}. ${city} area.`,
        location_name: `${trail.name}, ${city}`,
        trail_id: trail.id,
        activity_date: actDate,
        skill_level: tmpl.skill_level,
        max_participants: 4 + Math.floor(Math.random() * 8),
        current_participants: 1,
        permit_required: false,
        is_public: true,
        status: 'active',
        gear_required: ['helmet', 'water'],
        contact_method: 'in_app',
      };

      const r = await api('POST', 'activity_posts', post);
      if (r.ok) postCount++;
      else console.log(`    Error: ${r.error?.substring(0, 100)}`);
    }
  }
  console.log(`    Inserted ${postCount} activity posts ✅\n`);

  // ── REGION HIGHLIGHTS ──
  // These need center_point which is a geography column - skip via REST API
  // The data will still work with the trails/businesses that have cities
  console.log('  🗺️  Region highlights skipped (requires PostGIS geography column)\n');

  // Final counts
  console.log('Final database counts:');
  for (const t of ['permits', 'trails', 'businesses', 'reviews', 'activity_posts']) {
    const emoji = { permits: '📜', trails: '🥾', businesses: '🏪', reviews: '⭐', activity_posts: '📋' }[t];
    console.log(`  ${emoji} ${t}: ${await getCount(t)}`);
  }

  console.log('\n🎉 Database is fully seeded and ready!');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
