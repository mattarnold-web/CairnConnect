-- ==========================================================================
-- CairnConnect Database Seed Data (Expanded)
-- ==========================================================================
-- Run this in the Supabase SQL Editor to populate your database with
-- realistic outdoor activity data across 12+ regions worldwide.
--
-- Prerequisites:
--   - All migrations (001-019) have been run
--   - PostGIS extension is enabled
--
-- This script is idempotent: it uses ON CONFLICT DO NOTHING where possible.
-- ==========================================================================

BEGIN;

-- --------------------------------------------------------------------------
-- 1. Seed Users (needed as FK targets for reviews / activity posts)
-- --------------------------------------------------------------------------

INSERT INTO users (id, email, username, display_name, activity_preferences, preferred_skill_level)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'tyler@example.com', 'tyler_rides', 'Tyler R.', ARRAY['mtb','hiking','trail_running'], 'intermediate'),
  ('00000000-0000-0000-0000-000000000002', 'meera@example.com', 'meera_trails', 'Meera P.', ARRAY['hiking','trail_running','climbing'], 'intermediate'),
  ('00000000-0000-0000-0000-000000000003', 'colin@example.com', 'colin_west', 'Colin W.', ARRAY['mtb','hiking'], 'advanced'),
  ('00000000-0000-0000-0000-000000000004', 'sarah@example.com', 'sarah_climbs', 'Sarah K.', ARRAY['climbing','hiking','kayaking'], 'advanced'),
  ('00000000-0000-0000-0000-000000000005', 'dan@example.com', 'dan_mtb', 'Dan W.', ARRAY['mtb','trail_running'], 'intermediate'),
  ('00000000-0000-0000-0000-000000000006', 'ava@example.com', 'ava_hikes', 'Ava T.', ARRAY['hiking','trail_running','camping'], 'beginner'),
  ('00000000-0000-0000-0000-000000000007', 'jake@example.com', 'jake_shreds', 'Jake H.', ARRAY['mtb','skiing','snowboarding'], 'expert'),
  ('00000000-0000-0000-0000-000000000008', 'rosa@example.com', 'rosa_runs', 'Rosa M.', ARRAY['trail_running','hiking'], 'intermediate'),
  ('00000000-0000-0000-0000-000000000009', 'ben@example.com', 'ben_paddles', 'Ben L.', ARRAY['kayaking','standup_paddle','wild_swimming'], 'intermediate'),
  ('00000000-0000-0000-0000-000000000010', 'casey@example.com', 'casey_skis', 'Casey J.', ARRAY['skiing','snowboarding','hiking'], 'advanced'),
  ('00000000-0000-0000-0000-000000000011', 'luca@example.com', 'luca_enduro', 'Luca B.', ARRAY['mtb','trail_running'], 'advanced'),
  ('00000000-0000-0000-0000-000000000012', 'emma@example.com', 'emma_explores', 'Emma S.', ARRAY['hiking','camping','kayaking'], 'intermediate')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 2. Permits
-- --------------------------------------------------------------------------

INSERT INTO permits (id, name, type, fee, requires_reservation, reservation_url, info_url, geom, country, country_code, state_province, region)
VALUES
  (gen_random_uuid(), 'Dead Horse Point State Park Day Use', 'day_use', 15.00, false, NULL, 'https://stateparks.utah.gov/parks/dead-horse/', ST_SetSRID(ST_MakePoint(-109.7317, 38.4829), 4326)::geography, 'United States', 'US', 'Utah', 'Moab'),
  (gen_random_uuid(), 'Sand Flats Recreation Area Day Use', 'day_use', 5.00, false, NULL, 'https://www.grandcountyutah.net/352/Sand-Flats', ST_SetSRID(ST_MakePoint(-109.5128, 38.5912), 4326)::geography, 'United States', 'US', 'Utah', 'Moab'),
  (gen_random_uuid(), 'Deschutes National Forest Trail Park Pass', 'day_use', 5.00, false, NULL, 'https://www.fs.usda.gov/deschutes', ST_SetSRID(ST_MakePoint(-121.3153, 44.0582), 4326)::geography, 'United States', 'US', 'Oregon', 'Bend'),
  (gen_random_uuid(), 'Red Rock Pass (Coconino NF)', 'day_use', 5.00, false, NULL, 'https://www.fs.usda.gov/coconino', ST_SetSRID(ST_MakePoint(-111.7610, 34.8697), 4326)::geography, 'United States', 'US', 'Arizona', 'Sedona'),
  (gen_random_uuid(), 'Desolation Wilderness Day Permit', 'day_use', 0.00, true, 'https://www.recreation.gov/permits/233261', 'https://www.fs.usda.gov/eldorado', ST_SetSRID(ST_MakePoint(-120.1500, 38.9500), 4326)::geography, 'United States', 'US', 'California', 'Lake Tahoe'),
  (gen_random_uuid(), 'Zion National Park Entrance', 'day_use', 35.00, false, NULL, 'https://www.nps.gov/zion/', ST_SetSRID(ST_MakePoint(-112.9546, 37.2982), 4326)::geography, 'United States', 'US', 'Utah', 'Zion'),
  (gen_random_uuid(), 'Angels Landing Permit', 'day_use', 6.00, true, 'https://www.recreation.gov/permits/4675309', 'https://www.nps.gov/zion/planyourvisit/angels-landing-702702.htm', ST_SetSRID(ST_MakePoint(-112.9476, 37.2692), 4326)::geography, 'United States', 'US', 'Utah', 'Zion'),
  (gen_random_uuid(), 'Bryce Canyon National Park Entrance', 'day_use', 35.00, false, NULL, 'https://www.nps.gov/brca/', ST_SetSRID(ST_MakePoint(-112.1871, 37.6283), 4326)::geography, 'United States', 'US', 'Utah', 'Bryce Canyon'),
  (gen_random_uuid(), 'Gooseberry Mesa BLM', 'day_use', 0.00, false, NULL, 'https://www.blm.gov/visit/gooseberry-mesa', ST_SetSRID(ST_MakePoint(-113.1500, 37.1400), 4326)::geography, 'United States', 'US', 'Utah', 'St. George'),
  (gen_random_uuid(), 'Park City Mountain Resort Trail Access', 'day_use', 0.00, false, NULL, 'https://www.parkcitymountain.com', ST_SetSRID(ST_MakePoint(-111.5080, 40.6514), 4326)::geography, 'United States', 'US', 'Utah', 'Park City')
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------------------------
-- 3. Trails
-- --------------------------------------------------------------------------

-- ===== MOAB, UTAH =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Slickrock Trail', 'slickrock-trail',
  'The trail that put Moab on the mountain biking map. 10.5 miles of petrified sand dunes with traction you have to feel to believe. Painted white dashes mark the route across undulating Navajo Sandstone. Incredibly exposed -- bring sun protection and at least 3 liters of water.',
  ARRAY['mtb','hiking'], 'black', 'Advanced', 4,
  16900, 396, 396, 1524, 1402,
  'loop', ARRAY['sandstone','slickrock'],
  ST_SetSRID(ST_MakePoint(-109.5128, 38.5912), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Sand Flats Recreation Area Day Use' LIMIT 1),
  4.8, 1243, 18742, ARRAY['spring','fall'], 'community', true
),
(
  'Porcupine Rim', 'porcupine-rim',
  'One of the premier point-to-point descents in the world. 14 miles of singletrack starting above the La Sal Mountains with massive exposure along the Colorado River canyon rim. The final descent into the valley is steep and legendary.',
  ARRAY['mtb'], 'double_black', 'Expert', 5,
  22530, 244, 914, 1920, 1219,
  'point_to_point', ARRAY['singletrack','rock','sand'],
  ST_SetSRID(ST_MakePoint(-109.4432, 38.5955), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false, NULL,
  4.9, 876, 11234, ARRAY['spring','fall'], 'community', true
),
(
  'Whole Enchilada', 'whole-enchilada',
  'The ultimate Moab epic. A 26-mile point-to-point descent from the alpine aspen forests of the La Sal Mountains down to the Colorado River, dropping over 7,000 feet through five distinct ecosystems. Shuttle required.',
  ARRAY['mtb'], 'double_black', 'Expert', 5,
  41840, 305, 2195, 3505, 1219,
  'point_to_point', ARRAY['singletrack','rock','dirt','alpine'],
  ST_SetSRID(ST_MakePoint(-109.2700, 38.5100), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false, NULL,
  4.9, 1102, 14500, ARRAY['summer','fall'], 'community', true
),
(
  'Poison Spider Mesa', 'poison-spider-mesa',
  'Technical out-and-back across a high mesa with sweeping views of the Colorado River, Behind the Rocks, and the La Sal Mountains. The optional Portal Trail descent is a no-fall-zone cliff edge.',
  ARRAY['mtb','hiking'], 'double_black', 'Expert', 5,
  14480, 488, 488, 1585, 1219,
  'out_and_back', ARRAY['slickrock','rock','sand'],
  ST_SetSRID(ST_MakePoint(-109.5887, 38.5622), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false, NULL,
  4.7, 532, 7891, ARRAY['spring','fall'], 'community', true
),
(
  'Captain Ahab', 'captain-ahab',
  'A thrilling descent through sculpted sandstone bowls, ledge drops, and natural half-pipes. One of Moab''s most photogenic trails with features that reward creative line choice. Often linked with Amasa Back for a full day.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  5630, 61, 305, 1463, 1219,
  'point_to_point', ARRAY['slickrock','sandstone','singletrack'],
  ST_SetSRID(ST_MakePoint(-109.5910, 38.5480), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false, NULL,
  4.8, 723, 9100, ARRAY['spring','fall'], 'community', true
),
(
  'Mag 7', 'mag-7',
  'A classic Moab shuttle ride linking seven distinct trail segments from the high desert down to Gemini Bridges Road. Varied terrain includes slickrock, sandy washes, and fast doubletrack. Great intermediate option with a shuttle.',
  ARRAY['mtb'], 'blue', 'Intermediate', 3,
  27350, 183, 762, 1646, 1341,
  'point_to_point', ARRAY['singletrack','doubletrack','slickrock','sand'],
  ST_SetSRID(ST_MakePoint(-109.6600, 38.6400), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false, NULL,
  4.5, 645, 8700, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Amasa Back', 'amasa-back',
  'Challenging mesa-top ride with the optional Cliffhanger add-on that delivers some of the most technical and exposed riding in Moab. The climb is relentless but the views of Hurrah Pass and the Colorado River are staggering.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  15610, 457, 457, 1524, 1219,
  'out_and_back', ARRAY['slickrock','rock','singletrack'],
  ST_SetSRID(ST_MakePoint(-109.5865, 38.5532), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'caution', NOW() - INTERVAL '1 day', false, NULL,
  4.8, 612, 8923, ARRAY['spring','fall'], 'community', true
),
(
  'Klondike Bluffs', 'klondike-bluffs',
  'A fun network of trails near the Klondike Bluffs dinosaur track site north of Moab. Rolling slickrock terrain with moderate technical challenges and great views of the Book Cliffs. Less crowded than the southern trails.',
  ARRAY['mtb','hiking'], 'blue', 'Intermediate', 3,
  12870, 244, 244, 1524, 1402,
  'loop', ARRAY['slickrock','dirt','singletrack'],
  ST_SetSRID(ST_MakePoint(-109.6150, 38.7400), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false, NULL,
  4.3, 312, 4500, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Gemini Bridges', 'gemini-bridges',
  'A long, mostly downhill ride from the top access that passes two massive natural rock bridges spanning a deep canyon. Excellent intermediate ride and one of the best shuttle-assisted trails in the area.',
  ARRAY['mtb','hiking'], 'green', 'Beginner', 2,
  22530, 152, 610, 1646, 1219,
  'point_to_point', ARRAY['doubletrack','dirt','singletrack'],
  ST_SetSRID(ST_MakePoint(-109.6241, 38.6318), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false, NULL,
  4.3, 567, 9876, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Bar M Loop', 'bar-m-loop',
  'The perfect beginner trail in Moab. A flat, well-marked loop through open desert with views of the Moab Rim and the La Sal Mountains. Great for families and riders new to desert terrain.',
  ARRAY['mtb','hiking','trail_running'], 'green', 'Beginner', 1,
  12870, 61, 61, 1341, 1310,
  'loop', ARRAY['dirt','singletrack','sand'],
  ST_SetSRID(ST_MakePoint(-109.6100, 38.6500), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false, NULL,
  4.1, 423, 6500, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Dead Horse Point Rim Trail', 'dead-horse-point-rim-trail',
  'A stunning loop along the edge of Dead Horse Point State Park with jaw-dropping overlooks of the Colorado River gooseneck 2,000 feet below. Mostly smooth singletrack with a few rocky sections.',
  ARRAY['mtb','hiking','trail_running'], 'green', 'Beginner', 2,
  14160, 91, 91, 1829, 1768,
  'loop', ARRAY['singletrack','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-109.7317, 38.4829), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Dead Horse Point State Park Day Use' LIMIT 1),
  4.7, 1102, 12345, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Corona Arch Trail', 'corona-arch-trail',
  'Short but spectacular hiking trail to one of the largest free-standing arches in Utah. The route crosses railroad tracks, traverses slickrock, and includes a scramble section with fixed cables and a short ladder.',
  ARRAY['hiking','trail_running'], 'blue', 'Intermediate', 2,
  4828, 137, 137, 1341, 1244,
  'out_and_back', ARRAY['slickrock','rock','dirt'],
  ST_SetSRID(ST_MakePoint(-109.6204, 38.5808), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false, NULL,
  4.7, 1567, 0, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Fisher Towers Trail', 'fisher-towers-trail',
  'A surreal hike through towering Cutler sandstone formations that look like drip castles from another planet. The trail weaves between the towers with views of the Colorado River valley and the La Sal range.',
  ARRAY['hiking','trail_running'], 'blue', 'Intermediate', 2,
  7080, 224, 224, 1524, 1372,
  'out_and_back', ARRAY['dirt','rock','sand'],
  ST_SetSRID(ST_MakePoint(-109.3079, 38.7265), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '4 days', false, NULL,
  4.6, 987, 0, ARRAY['spring','fall'], 'community', true
),
(
  'Negro Bill Canyon', 'negro-bill-canyon',
  'A scenic canyon hike following a perennial creek to Morning Glory Natural Bridge, one of the largest natural rock bridges in the country at 243 feet. Cottonwood shade and creek crossings keep it cool on hot days.',
  ARRAY['hiking'], 'blue', 'Intermediate', 2,
  7240, 183, 183, 1402, 1280,
  'out_and_back', ARRAY['dirt','rock','sand','creek crossings'],
  ST_SetSRID(ST_MakePoint(-109.5040, 38.6070), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false, NULL,
  4.5, 678, 0, ARRAY['spring','fall'], 'community', true
),
(
  'Courthouse Wash', 'courthouse-wash',
  'An easy-to-moderate canyon hike through a wide wash with towering sandstone walls and natural arches. Several ancient petroglyph panels along the route make it a cultural as well as scenic experience.',
  ARRAY['hiking'], 'green', 'Beginner', 1,
  8050, 46, 46, 1280, 1250,
  'out_and_back', ARRAY['sand','rock','wash'],
  ST_SetSRID(ST_MakePoint(-109.5900, 38.6130), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false, NULL,
  4.2, 345, 0, ARRAY['spring','fall','winter'], 'community', true
);

-- ===== PARK CITY, UTAH =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Mid Mountain Trail', 'mid-mountain-trail',
  'Park City''s signature traverse. 22 miles of singletrack contouring through aspen groves and wildflower meadows at roughly 8,000 feet. Connects Park City Mountain Resort to Deer Valley with stunning Wasatch views throughout.',
  ARRAY['mtb','hiking','trail_running'], 'blue', 'Intermediate', 3,
  35400, 610, 610, 2560, 2290,
  'point_to_point', ARRAY['singletrack','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-111.5080, 40.6514), 4326)::geography,
  'Park City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.7, 1456, 15600, ARRAY['summer','fall'], 'community', true
),
(
  'Armstrong Trail', 'armstrong-trail',
  'A well-built, flowing singletrack that climbs steadily through aspen forest before joining Mid Mountain. The bermed corners and smooth surface make it one of the most popular climbs in the Park City trail system.',
  ARRAY['mtb','trail_running'], 'blue', 'Intermediate', 2,
  5630, 305, 30, 2440, 2135,
  'point_to_point', ARRAY['singletrack','dirt'],
  ST_SetSRID(ST_MakePoint(-111.5100, 40.6480), 4326)::geography,
  'Park City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.5, 876, 11200, ARRAY['summer','fall'], 'community', true
),
(
  'Wasatch Crest Trail', 'wasatch-crest-trail',
  'A bucket-list alpine ride along the spine of the Wasatch Range with views into both Park City and Big Cottonwood Canyon. Exposed ridgeline riding above 10,000 feet with technical rocky sections and wildflower-lined meadows.',
  ARRAY['mtb','hiking'], 'black', 'Advanced', 4,
  16100, 305, 915, 3050, 2440,
  'point_to_point', ARRAY['singletrack','rock','alpine'],
  ST_SetSRID(ST_MakePoint(-111.5860, 40.6350), 4326)::geography,
  'Park City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false,
  4.9, 1234, 8900, ARRAY['summer','fall'], 'community', true
),
(
  'Spiro Trail', 'spiro-trail',
  'A purpose-built climbing trail that ascends from the base of Park City Mountain Resort through scrub oak and aspen. Smooth, well-graded switchbacks make the 1,500-foot climb manageable. Connects to Mid Mountain at the top.',
  ARRAY['mtb','trail_running'], 'blue', 'Intermediate', 2,
  7240, 457, 30, 2440, 2010,
  'point_to_point', ARRAY['singletrack','dirt'],
  ST_SetSRID(ST_MakePoint(-111.5130, 40.6540), 4326)::geography,
  'Park City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.4, 567, 7800, ARRAY['summer','fall'], 'community', true
),
(
  'Iron Mountain Trail', 'iron-mountain-trail',
  'A rugged, technical trail on the north side of Park City with steep climbs and rocky descents through old mining terrain. Remnants of historic silver mines dot the hillside. Best for experienced riders seeking challenge.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  8050, 396, 396, 2590, 2290,
  'loop', ARRAY['singletrack','rock','dirt'],
  ST_SetSRID(ST_MakePoint(-111.4980, 40.6620), 4326)::geography,
  'Park City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.5, 423, 5600, ARRAY['summer','fall'], 'community', true
),
(
  'Glenwild Loop', 'glenwild-loop',
  'A rolling cross-country loop through sage and aspen north of Park City. Smooth singletrack with gentle grades makes it ideal for a recovery ride or quick after-work spin. Well-marked with multiple cutoff options.',
  ARRAY['mtb','trail_running','hiking'], 'green', 'Beginner', 2,
  12070, 213, 213, 2200, 2070,
  'loop', ARRAY['singletrack','dirt'],
  ST_SetSRID(ST_MakePoint(-111.5250, 40.7200), 4326)::geography,
  'Park City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.3, 345, 4500, ARRAY['summer','fall'], 'community', true
);

-- ===== ST. GEORGE / HURRICANE, UTAH =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Gooseberry Mesa', 'gooseberry-mesa',
  'One of the best mountain bike trails on Earth. A mesa-top network of slickrock, technical singletrack, and jaw-dropping views of Zion National Park. The white-line slickrock sections are legendary and the exposure is real.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  19310, 366, 366, 1585, 1463,
  'network', ARRAY['slickrock','singletrack','rock'],
  ST_SetSRID(ST_MakePoint(-113.1500, 37.1400), 4326)::geography,
  'Hurricane', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.9, 1890, 22300, ARRAY['spring','fall','winter'], 'community', true
),
(
  'JEM Trail', 'jem-trail',
  'A smooth, flowy desert singletrack loop through the Hurricane Cliffs area. Packed dirt with gentle rollers and wide-open views of the Virgin River valley. Perfect warm-up or recovery ride near Hurricane.',
  ARRAY['mtb','trail_running'], 'blue', 'Intermediate', 2,
  16100, 244, 244, 1097, 975,
  'loop', ARRAY['singletrack','dirt','sand'],
  ST_SetSRID(ST_MakePoint(-113.2600, 37.1350), 4326)::geography,
  'Hurricane', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.5, 876, 12400, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Barrel Roll', 'barrel-roll',
  'A fast, technical descent near Hurricane with loose over hard-pack, tight corners, and natural rock features. Named for the barrel cactus along the route. Links into the greater Hurricane Cliffs system.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  4830, 30, 244, 1097, 853,
  'point_to_point', ARRAY['singletrack','rock','dirt'],
  ST_SetSRID(ST_MakePoint(-113.2500, 37.1250), 4326)::geography,
  'Hurricane', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.6, 423, 6700, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Church Rocks', 'church-rocks',
  'A beginner-friendly loop near the Hurricane Cliffs with smooth singletrack and gentle climbs through red desert terrain. Great views of the surrounding mesas and a nice introduction to desert riding.',
  ARRAY['mtb','hiking'], 'green', 'Beginner', 1,
  8050, 122, 122, 975, 914,
  'loop', ARRAY['singletrack','dirt','sand'],
  ST_SetSRID(ST_MakePoint(-113.2700, 37.1400), 4326)::geography,
  'Hurricane', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.2, 567, 8900, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Bear Claw Poppy', 'bear-claw-poppy',
  'A purpose-built trail system in the Red Cliffs Desert Reserve near St. George. Smooth, fast singletrack with berms, rollers, and desert scenery. Named after the rare dwarf bear claw poppy that grows here.',
  ARRAY['mtb','trail_running'], 'blue', 'Intermediate', 2,
  16100, 183, 183, 975, 853,
  'network', ARRAY['singletrack','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-113.6300, 37.0700), 4326)::geography,
  'St. George', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false,
  4.4, 654, 9800, ARRAY['fall','winter','spring'], 'community', true
);

-- ===== ZION NATIONAL PARK, UTAH =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Angels Landing', 'angels-landing',
  'One of the most famous hikes in the American West. A steep, paved trail leads to Walter''s Wiggles, then a chain-assisted scramble along a knife-edge ridge with 1,000-foot drops on both sides. The view from the summit is extraordinary. Permit required since 2022.',
  ARRAY['hiking'], 'black', 'Advanced', 4,
  8530, 453, 453, 1763, 1310,
  'out_and_back', ARRAY['paved','rock','chains'],
  ST_SetSRID(ST_MakePoint(-112.9476, 37.2692), 4326)::geography,
  'Springdale', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Angels Landing Permit' LIMIT 1),
  4.9, 8900, 0, ARRAY['spring','fall'], 'community', true
),
(
  'The Narrows (Bottom Up)', 'the-narrows-bottom-up',
  'A legendary river hike through the narrowest section of Zion Canyon. Wade and sometimes swim through the Virgin River between 1,000-foot sandstone walls. Unique and unforgettable. Water shoes and trekking poles essential.',
  ARRAY['hiking'], 'blue', 'Intermediate', 3,
  16090, 107, 107, 1310, 1219,
  'out_and_back', ARRAY['river','rock','sand'],
  ST_SetSRID(ST_MakePoint(-112.9485, 37.2852), 4326)::geography,
  'Springdale', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Zion National Park Entrance' LIMIT 1),
  4.9, 6700, 0, ARRAY['summer','fall'], 'community', true
),
(
  'Observation Point', 'observation-point',
  'A challenging hike to the highest viewpoint in Zion Canyon, towering 2,148 feet above the valley floor. The trail switchbacks through Echo Canyon with its hanging gardens before emerging onto the exposed sandstone rim.',
  ARRAY['hiking'], 'black', 'Advanced', 3,
  12870, 655, 655, 2148, 1310,
  'out_and_back', ARRAY['dirt','rock','paved'],
  ST_SetSRID(ST_MakePoint(-112.9410, 37.2780), 4326)::geography,
  'Springdale', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', true,
  (SELECT id FROM permits WHERE name = 'Zion National Park Entrance' LIMIT 1),
  4.8, 3400, 0, ARRAY['spring','fall'], 'community', true
),
(
  'Canyon Overlook Trail', 'canyon-overlook-trail',
  'A short, rewarding hike to a stunning overlook of lower Zion Canyon and Pine Creek. The trail crosses sandstone ledges and passes through a small slot canyon. One of the best payoff-to-effort ratios in the park.',
  ARRAY['hiking'], 'green', 'Beginner', 2,
  1610, 49, 49, 1524, 1475,
  'out_and_back', ARRAY['rock','sandstone'],
  ST_SetSRID(ST_MakePoint(-112.9400, 37.2130), 4326)::geography,
  'Springdale', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Zion National Park Entrance' LIMIT 1),
  4.6, 4500, 0, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Emerald Pools Trail', 'emerald-pools-trail',
  'A popular series of pool and waterfall destinations accessed via interconnected trails. The Lower Pool is an easy walk; the Upper Pool requires a steeper climb through a hanging garden. Family-friendly lower section.',
  ARRAY['hiking'], 'green', 'Beginner', 1,
  4830, 107, 107, 1372, 1280,
  'out_and_back', ARRAY['paved','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-112.9560, 37.2590), 4326)::geography,
  'Springdale', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Zion National Park Entrance' LIMIT 1),
  4.3, 3200, 0, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Watchman Trail', 'watchman-trail',
  'A moderate loop near the Zion Canyon Visitor Center with views of the Watchman, the Towers of the Virgin, and the town of Springdale. Less crowded than the main canyon trails and great for sunset.',
  ARRAY['hiking','trail_running'], 'green', 'Beginner', 1,
  5150, 113, 113, 1280, 1189,
  'loop', ARRAY['dirt','rock','gravel'],
  ST_SetSRID(ST_MakePoint(-112.9870, 37.2000), 4326)::geography,
  'Springdale', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Zion National Park Entrance' LIMIT 1),
  4.4, 2100, 0, ARRAY['spring','fall','winter'], 'community', true
);

-- ===== BRYCE CANYON, UTAH =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Navajo Loop Trail', 'navajo-loop-trail',
  'A steep descent through narrow slot-like switchbacks into the heart of Bryce''s hoodoo amphitheater. Walk among the towering orange and white spires on the canyon floor before climbing back to the rim. Often combined with Queens Garden.',
  ARRAY['hiking'], 'blue', 'Intermediate', 2,
  2250, 168, 168, 2440, 2290,
  'loop', ARRAY['dirt','rock','gravel'],
  ST_SetSRID(ST_MakePoint(-112.1680, 37.6241), 4326)::geography,
  'Bryce Canyon', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Bryce Canyon National Park Entrance' LIMIT 1),
  4.7, 5600, 0, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Queens Garden Trail', 'queens-garden-trail',
  'The easiest trail into the Bryce amphitheater, descending through a wonderland of hoodoos to a formation that resembles Queen Victoria. Often linked with Navajo Loop for the park''s most popular combination hike.',
  ARRAY['hiking'], 'green', 'Beginner', 1,
  2900, 104, 104, 2440, 2350,
  'out_and_back', ARRAY['dirt','gravel','rock'],
  ST_SetSRID(ST_MakePoint(-112.1620, 37.6270), 4326)::geography,
  'Bryce Canyon', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Bryce Canyon National Park Entrance' LIMIT 1),
  4.6, 4800, 0, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Peek-a-Boo Loop Trail', 'peek-a-boo-loop-trail',
  'A strenuous loop that descends into the amphitheater and winds through towering hoodoo formations, natural windows, and narrow passages. The most immersive below-rim experience in Bryce with frequent elevation changes.',
  ARRAY['hiking'], 'blue', 'Intermediate', 2,
  8850, 457, 457, 2440, 2200,
  'loop', ARRAY['dirt','rock','gravel'],
  ST_SetSRID(ST_MakePoint(-112.1620, 37.6200), 4326)::geography,
  'Bryce Canyon', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', true,
  (SELECT id FROM permits WHERE name = 'Bryce Canyon National Park Entrance' LIMIT 1),
  4.7, 2300, 0, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Fairyland Loop Trail', 'fairyland-loop-trail',
  'A long, uncrowded loop through some of Bryce''s most dramatic hoodoo formations including Tower Bridge and the Chinese Wall. Fewer hikers than the main amphitheater trails make this feel like a personal exploration.',
  ARRAY['hiking'], 'black', 'Advanced', 2,
  12870, 549, 549, 2440, 2150,
  'loop', ARRAY['dirt','rock','gravel'],
  ST_SetSRID(ST_MakePoint(-112.1500, 37.6400), 4326)::geography,
  'Bryce Canyon', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Bryce Canyon National Park Entrance' LIMIT 1),
  4.8, 1800, 0, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Under the Rim Trail', 'under-the-rim-trail',
  'A multi-day backpacking route traversing the full length of Bryce Canyon below the rim. Remote, quiet, and passing through varied terrain from hoodoo gardens to ponderosa forest. Backcountry permit required for camping.',
  ARRAY['hiking'], 'black', 'Advanced', 3,
  37000, 1524, 1890, 2750, 2050,
  'point_to_point', ARRAY['dirt','rock','gravel'],
  ST_SetSRID(ST_MakePoint(-112.1700, 37.6200), 4326)::geography,
  'Bryce Canyon', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '4 days', true,
  (SELECT id FROM permits WHERE name = 'Bryce Canyon National Park Entrance' LIMIT 1),
  4.7, 890, 0, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== SALT LAKE CITY / WASATCH, UTAH =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Bonneville Shoreline Trail', 'bonneville-shoreline-trail',
  'A 100-mile singletrack traversing the ancient shoreline of Lake Bonneville along the Wasatch Front. Smooth, rolling terrain with views of the Salt Lake Valley below and the Wasatch peaks above. Accessible from dozens of trailheads.',
  ARRAY['mtb','hiking','trail_running'], 'green', 'Beginner', 2,
  160900, 1524, 1524, 1615, 1372,
  'point_to_point', ARRAY['singletrack','dirt','gravel'],
  ST_SetSRID(ST_MakePoint(-111.8540, 40.7460), 4326)::geography,
  'Salt Lake City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.5, 2345, 18000, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Mount Olympus', 'mount-olympus',
  'A punishing but rewarding hike to the iconic twin-peaked summit visible from all of Salt Lake City. Steep, rocky trail with exposed scrambling near the top. The views of the entire Wasatch Front from the 9,026-foot summit are magnificent.',
  ARRAY['hiking'], 'black', 'Advanced', 4,
  11270, 1220, 1220, 2752, 1530,
  'out_and_back', ARRAY['rock','dirt','scramble'],
  ST_SetSRID(ST_MakePoint(-111.7700, 40.6570), 4326)::geography,
  'Salt Lake City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.7, 1890, 0, ARRAY['summer','fall'], 'community', true
),
(
  'Lake Blanche Trail', 'lake-blanche-trail',
  'A popular Wasatch hike to a stunning alpine lake nestled beneath the towering cliffs of Sundial Peak. Steep switchbacks through pine and aspen forest open to a gorgeous cirque basin. The lake is a deep, cold turquoise.',
  ARRAY['hiking'], 'blue', 'Intermediate', 2,
  10460, 854, 854, 2895, 2042,
  'out_and_back', ARRAY['dirt','rock','roots'],
  ST_SetSRID(ST_MakePoint(-111.7250, 40.6260), 4326)::geography,
  'Salt Lake City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.7, 2100, 0, ARRAY['summer','fall'], 'community', true
),
(
  'Pipeline Trail (Millcreek Canyon)', 'pipeline-trail-millcreek',
  'A fast, flowy singletrack traversing the north side of Millcreek Canyon. Smooth and rolling with a few rocky sections. Open to bikes on even-numbered days only. One of SLC''s most accessible and beloved after-work rides.',
  ARRAY['mtb','trail_running','hiking'], 'blue', 'Intermediate', 2,
  9250, 183, 183, 2135, 1981,
  'point_to_point', ARRAY['singletrack','dirt'],
  ST_SetSRID(ST_MakePoint(-111.7160, 40.6840), 4326)::geography,
  'Salt Lake City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.5, 1567, 14500, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Corner Canyon Trail System', 'corner-canyon-trails',
  'A massive trail network on the south end of the Wasatch Front in Draper. Over 40 miles of purpose-built singletrack ranging from beginner flow trails to expert-only descents. Rush and Maple Hollow are standouts.',
  ARRAY['mtb','trail_running','hiking'], 'blue', 'Intermediate', 3,
  64370, 915, 915, 2135, 1463,
  'network', ARRAY['singletrack','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-111.8100, 40.5180), 4326)::geography,
  'Draper', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.6, 1890, 22000, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== OGDEN, UTAH =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Wheeler Canyon Trail', 'wheeler-canyon-trail',
  'A shaded canyon hike following a creek through dense forest with wildflowers and small waterfalls. A cooler option during summer heat. The trail is well-maintained and gradually gains elevation through the narrow canyon.',
  ARRAY['hiking','trail_running'], 'blue', 'Intermediate', 2,
  12070, 457, 457, 2135, 1676,
  'out_and_back', ARRAY['dirt','rock','roots'],
  ST_SetSRID(ST_MakePoint(-111.8400, 41.2850), 4326)::geography,
  'Ogden', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.4, 567, 0, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Ben Lomond Peak', 'ben-lomond-peak',
  'A strenuous hike to the 9,712-foot summit north of Ogden with 360-degree views of the Great Salt Lake, the Wasatch Range, and the northern Utah valleys. The trail passes through aspen groves, meadows, and rocky alpine terrain.',
  ARRAY['hiking'], 'black', 'Advanced', 3,
  17700, 1372, 1372, 2960, 1585,
  'out_and_back', ARRAY['dirt','rock','alpine'],
  ST_SetSRID(ST_MakePoint(-111.8250, 41.3600), 4326)::geography,
  'Ogden', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false,
  4.6, 678, 0, ARRAY['summer','fall'], 'community', true
),
(
  'Waterfall Canyon Trail', 'waterfall-canyon-trail',
  'A short, steep hike to a 200-foot waterfall tucked into a narrow canyon above Ogden. Popular with locals for a quick workout. The waterfall is most impressive during spring snowmelt. Ice formations in winter.',
  ARRAY['hiking','trail_running'], 'blue', 'Intermediate', 2,
  4020, 274, 274, 1676, 1402,
  'out_and_back', ARRAY['dirt','rock'],
  ST_SetSRID(ST_MakePoint(-111.8180, 41.2520), 4326)::geography,
  'Ogden', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.5, 1234, 0, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== BEND, OREGON =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Phil''s Trail Complex', 'phils-trail-complex',
  'The heart of Bend''s legendary trail system. Miles of flowy, bermed singletrack through ponderosa pine forest. Multiple loops let you dial in the perfect ride length from a quick after-work loop to an all-day epic.',
  ARRAY['mtb','trail_running'], 'blue', 'Intermediate', 3,
  14500, 305, 305, 1372, 1280,
  'network', ARRAY['singletrack','pumice','dirt'],
  ST_SetSRID(ST_MakePoint(-121.3548, 44.0342), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Deschutes National Forest Trail Park Pass' LIMIT 1),
  4.7, 1834, 24500, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Tiddlywinks', 'tiddlywinks',
  'One of Bend''s most popular intermediate trails with smooth, flowing singletrack through open pine forest. Gentle climbs and fun descents make it perfect for building skills or a relaxed ride.',
  ARRAY['mtb'], 'blue', 'Intermediate', 2,
  8400, 183, 183, 1340, 1280,
  'loop', ARRAY['singletrack','pumice'],
  ST_SetSRID(ST_MakePoint(-121.3610, 44.0280), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Deschutes National Forest Trail Park Pass' LIMIT 1),
  4.5, 892, 15600, ARRAY['spring','summer','fall'], 'community', true
),
(
  'South Sister Summit', 'south-sister-summit',
  'The highest point in Bend''s backyard at 10,358 feet. A non-technical but demanding hike up volcanic scree to panoramic views of the entire Cascade Range. Snowfields persist through July on the upper slopes.',
  ARRAY['hiking'], 'black', 'Advanced', 3,
  18500, 1494, 1494, 3157, 1663,
  'out_and_back', ARRAY['volcanic rock','scree','snow'],
  ST_SetSRID(ST_MakePoint(-121.7692, 44.1033), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false, NULL,
  4.8, 2145, 0, ARRAY['summer','fall'], 'community', true
),
(
  'Tumalo Falls Trail', 'tumalo-falls-trail',
  'A popular hike starting at the impressive 97-foot Tumalo Falls waterfall. The trail continues upstream past a series of smaller cascades through lush forest. Can be combined with other trails for a longer loop.',
  ARRAY['hiking','trail_running'], 'blue', 'Intermediate', 2,
  10900, 366, 366, 1860, 1616,
  'out_and_back', ARRAY['dirt','rock','roots'],
  ST_SetSRID(ST_MakePoint(-121.5676, 44.0323), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Deschutes National Forest Trail Park Pass' LIMIT 1),
  4.6, 1890, 0, ARRAY['summer','fall'], 'community', true
),
(
  'Deschutes River Trail', 'deschutes-river-trail',
  'A scenic out-and-back along the Deschutes River through old-growth ponderosa. Popular with runners and hikers alike, with several river access points for a cool dip on hot summer days.',
  ARRAY['hiking','trail_running'], 'green', 'Beginner', 1,
  17700, 120, 120, 1130, 1100,
  'out_and_back', ARRAY['dirt','gravel','boardwalk'],
  ST_SetSRID(ST_MakePoint(-121.3335, 44.0491), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false, NULL,
  4.4, 1456, 0, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Storm King Trail', 'storm-king-trail',
  'A challenging trail in the upper Phil''s area with more technical rock features and steeper grades than the lower trails. Rewards skilled riders with natural rock drops, tight switchbacks, and old-growth forest.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  6440, 244, 244, 1400, 1310,
  'loop', ARRAY['singletrack','rock','pumice','roots'],
  ST_SetSRID(ST_MakePoint(-121.3650, 44.0250), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Deschutes National Forest Trail Park Pass' LIMIT 1),
  4.6, 645, 8900, ARRAY['summer','fall'], 'community', true
),
(
  'Whoops Trail', 'whoops-trail',
  'Fast, flowy, and full of natural features. Whoops is a Bend MTB classic with bermed corners, small drops, and rollers that reward speed. Connects into the larger Phil''s-area network for all-day linking.',
  ARRAY['mtb'], 'blue', 'Intermediate', 3,
  5200, 110, 150, 1350, 1280,
  'point_to_point', ARRAY['singletrack','pumice','dirt'],
  ST_SetSRID(ST_MakePoint(-121.3580, 44.0315), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Deschutes National Forest Trail Park Pass' LIMIT 1),
  4.6, 743, 11200, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== SEDONA, ARIZONA =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Hiline Trail', 'hiline-trail',
  'Sedona''s most popular advanced mountain bike trail. Technical slickrock sections, tight switchbacks, and stunning red rock exposure. The trail traverses high above the valley with panoramic views of Cathedral Rock and Courthouse Butte.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  9700, 274, 274, 1341, 1219,
  'out_and_back', ARRAY['slickrock','singletrack','rock'],
  ST_SetSRID(ST_MakePoint(-111.7670, 34.8310), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.8, 1456, 15600, ARRAY['fall','winter','spring'], 'community', true
),
(
  'Hangover Trail', 'hangover-trail',
  'One of Sedona''s most exposed and technical trails. Narrow ledges, steep drop-offs, and demanding slickrock sections high above the valley floor. Not for the faint of heart, but the views are extraordinary.',
  ARRAY['mtb','hiking'], 'double_black', 'Expert', 5,
  4800, 198, 198, 1372, 1250,
  'out_and_back', ARRAY['slickrock','rock','singletrack'],
  ST_SetSRID(ST_MakePoint(-111.7700, 34.8280), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.9, 876, 8900, ARRAY['fall','winter','spring'], 'community', true
),
(
  'Cathedral Rock Trail', 'cathedral-rock-trail',
  'A short but steep scramble to Sedona''s most photographed landmark. The final section requires hand-over-hand climbing on smooth sandstone slabs. The views of Oak Creek Canyon and the surrounding red rock formations are iconic.',
  ARRAY['hiking'], 'blue', 'Intermediate', 3,
  1800, 183, 183, 1402, 1219,
  'out_and_back', ARRAY['rock','sandstone','dirt'],
  ST_SetSRID(ST_MakePoint(-111.7897, 34.8226), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.7, 4567, 0, ARRAY['fall','winter','spring'], 'community', true
),
(
  'Bell Rock Pathway', 'bell-rock-pathway',
  'An easy trail circling the base of the iconic Bell Rock formation with options to scramble partway up the rock itself. Flat, well-maintained, and accessible. One of the best introductions to Sedona''s red rock landscape.',
  ARRAY['hiking','trail_running'], 'green', 'Beginner', 1,
  5790, 61, 61, 1310, 1250,
  'loop', ARRAY['dirt','rock','gravel'],
  ST_SetSRID(ST_MakePoint(-111.7630, 34.8080), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.4, 3456, 0, ARRAY['fall','winter','spring'], 'community', true
),
(
  'Broken Arrow Trail', 'broken-arrow-trail',
  'A Sedona classic combining smooth red slickrock riding with stunning scenery. Passes by Chicken Point with its famous overlook. Good for intermediate riders who want a taste of Sedona slickrock.',
  ARRAY['mtb','hiking'], 'blue', 'Intermediate', 3,
  6400, 137, 137, 1310, 1219,
  'out_and_back', ARRAY['slickrock','singletrack','dirt'],
  ST_SetSRID(ST_MakePoint(-111.7780, 34.8350), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.6, 2345, 12400, ARRAY['fall','winter','spring'], 'community', true
),
(
  'Slim Shady Trail', 'slim-shady-trail',
  'Flowy, fast singletrack weaving through juniper forest with punchy climbs and satisfying descents. One of Sedona''s newer purpose-built mountain bike trails with great drainage and progressive features.',
  ARRAY['mtb'], 'blue', 'Intermediate', 2,
  5600, 152, 152, 1310, 1219,
  'loop', ARRAY['singletrack','dirt'],
  ST_SetSRID(ST_MakePoint(-111.7500, 34.8400), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.5, 654, 7800, ARRAY['fall','winter','spring'], 'community', true
),
(
  'Templeton Trail', 'templeton-trail',
  'A mellow trail winding through red rock terrain at the base of Cathedral Rock with a creek crossing to Oak Creek. Beautiful reflections of Cathedral Rock in the water at the turnaround. A Sedona classic.',
  ARRAY['hiking','trail_running'], 'green', 'Beginner', 1,
  6440, 76, 76, 1250, 1189,
  'out_and_back', ARRAY['dirt','rock','sand'],
  ST_SetSRID(ST_MakePoint(-111.7850, 34.8250), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.5, 2100, 0, ARRAY['fall','winter','spring'], 'community', true
),
(
  'West Fork Oak Creek', 'west-fork-oak-creek',
  'A gorgeous canyon hike through towering walls of red and white sandstone with dozens of creek crossings. The fall colors in the narrow canyon are legendary. One of the most popular hikes in Arizona.',
  ARRAY['hiking'], 'green', 'Beginner', 1,
  10300, 122, 122, 1650, 1585,
  'out_and_back', ARRAY['dirt','rock','creek crossings'],
  ST_SetSRID(ST_MakePoint(-111.7445, 34.9818), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.8, 5678, 0, ARRAY['fall','spring'], 'community', true
);

-- ===== LAKE TAHOE, CA/NV =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Flume Trail', 'flume-trail',
  'A legendary high-altitude singletrack with jaw-dropping views of Lake Tahoe''s turquoise waters 1,500 feet below. The trail follows an old logging flume route carved into the mountainside. Best ridden with a shuttle to the top.',
  ARRAY['mtb','hiking'], 'blue', 'Intermediate', 3,
  22500, 305, 760, 2530, 1920,
  'point_to_point', ARRAY['singletrack','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-119.9040, 39.2040), 4326)::geography,
  'Incline Village', 'Nevada', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.8, 2345, 18900, ARRAY['summer','fall'], 'community', true
),
(
  'Tahoe Rim Trail - Spooner to Snow Valley Peak', 'tahoe-rim-trail-spooner-snow-valley',
  'A spectacular section of the 165-mile Tahoe Rim Trail climbing through pine forest to exposed granite ridgelines with 360-degree views of the lake and the Carson Valley.',
  ARRAY['hiking','mtb','trail_running'], 'black', 'Advanced', 3,
  16100, 610, 610, 2860, 2250,
  'out_and_back', ARRAY['singletrack','rock','dirt'],
  ST_SetSRID(ST_MakePoint(-119.9170, 39.1050), 4326)::geography,
  'Incline Village', 'Nevada', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false,
  4.7, 1234, 5600, ARRAY['summer','fall'], 'community', true
),
(
  'Eagle Falls to Eagle Lake', 'eagle-falls-eagle-lake',
  'A short, steep hike past a picturesque waterfall to a pristine alpine lake nestled in a granite basin. The views of Emerald Bay from the trail are some of the most photographed in Tahoe.',
  ARRAY['hiking'], 'blue', 'Intermediate', 2,
  3200, 152, 152, 2070, 1920,
  'out_and_back', ARRAY['granite','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-120.1110, 38.9530), 4326)::geography,
  'South Lake Tahoe', 'California', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.5, 3456, 0, ARRAY['summer','fall'], 'community', true
),
(
  'Mr. Toad''s Wild Ride', 'mr-toads-wild-ride',
  'One of Tahoe''s gnarliest descents. A sustained, rocky, root-laden plunge through the forest that demands full attention and a willingness to get bucked. Not for the timid, but a bucket-list ride.',
  ARRAY['mtb'], 'double_black', 'Expert', 5,
  6400, 30, 550, 2620, 2070,
  'point_to_point', ARRAY['rock','roots','singletrack'],
  ST_SetSRID(ST_MakePoint(-120.0350, 38.8220), 4326)::geography,
  'South Lake Tahoe', 'California', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.7, 987, 8700, ARRAY['summer','fall'], 'community', true
),
(
  'Powerline Trail', 'powerline-trail',
  'A sustained, technical climb and descent following an old powerline cut through the forest above Tahoe City. Connects into the larger North Shore trail network. Rocky, rooty, and rewarding.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  11300, 457, 457, 2320, 1920,
  'out_and_back', ARRAY['singletrack','rock','roots'],
  ST_SetSRID(ST_MakePoint(-120.1450, 39.1720), 4326)::geography,
  'Tahoe City', 'California', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.4, 567, 6500, ARRAY['summer','fall'], 'community', true
);

-- ===== WHISTLER, BC =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'A-Line', 'a-line',
  'The most iconic jump trail in the world. Perfectly sculpted tabletops and berms descend through the Whistler Mountain Bike Park. A rite of passage for every mountain biker who visits Whistler.',
  ARRAY['mtb'], 'blue', 'Intermediate', 3,
  3200, 0, 430, 1290, 860,
  'point_to_point', ARRAY['dirt','machine-built'],
  ST_SetSRID(ST_MakePoint(-122.9570, 50.0866), 4326)::geography,
  'Whistler', 'British Columbia', 'Canada', 'CA',
  'closed', NOW() - INTERVAL '5 days', false,
  4.9, 3456, 89000, ARRAY['summer'], 'community', true
),
(
  'Dirt Merchant', 'dirt-merchant',
  'Smooth, flowy jump trail with a mix of tables and step-ups. Slightly mellower than A-Line but still packs plenty of airtime. Great for progressing jumping skills in the bike park.',
  ARRAY['mtb'], 'blue', 'Intermediate', 3,
  2100, 0, 310, 1170, 860,
  'point_to_point', ARRAY['dirt','machine-built'],
  ST_SetSRID(ST_MakePoint(-122.9540, 50.0870), 4326)::geography,
  'Whistler', 'British Columbia', 'Canada', 'CA',
  'closed', NOW() - INTERVAL '5 days', false,
  4.7, 1234, 45000, ARRAY['summer'], 'community', true
),
(
  'Comfortably Numb', 'comfortably-numb',
  'A legendary cross-country epic in the Whistler valley. Smooth singletrack winds through ancient cedar forests with creek crossings and mountain views. The climb is sustained but the trail quality is world-class throughout.',
  ARRAY['mtb','trail_running'], 'blue', 'Intermediate', 3,
  21000, 640, 820, 1050, 640,
  'point_to_point', ARRAY['singletrack','roots','rock'],
  ST_SetSRID(ST_MakePoint(-122.9237, 50.1442), 4326)::geography,
  'Whistler', 'British Columbia', 'Canada', 'CA',
  'open', NOW() - INTERVAL '3 days', false,
  4.8, 2100, 32000, ARRAY['summer','fall'], 'community', true
),
(
  'Top of the World', 'top-of-the-world',
  'Whistler Bike Park''s crown jewel. A long, technical descent from the peak of Whistler Mountain through alpine meadows, rocky chutes, and old-growth forest. The views alone are worth the lift ticket.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  7800, 0, 1100, 2182, 1082,
  'point_to_point', ARRAY['rock','alpine','singletrack'],
  ST_SetSRID(ST_MakePoint(-122.9500, 50.0600), 4326)::geography,
  'Whistler', 'British Columbia', 'Canada', 'CA',
  'closed', NOW() - INTERVAL '5 days', false,
  4.9, 2890, 28000, ARRAY['summer'], 'community', true
),
(
  'High Note Trail', 'high-note-trail',
  'An alpine hiking trail with panoramic views of Cheakamus Lake, Black Tusk, and the volcanic peaks of Garibaldi Park. Accessed from the top of the Peak Express chair on Whistler Mountain.',
  ARRAY['hiking'], 'blue', 'Intermediate', 2,
  9500, 200, 500, 1850, 1350,
  'point_to_point', ARRAY['alpine','rock','dirt'],
  ST_SetSRID(ST_MakePoint(-122.9480, 50.0621), 4326)::geography,
  'Whistler', 'British Columbia', 'Canada', 'CA',
  'closed', NOW() - INTERVAL '4 days', false,
  4.7, 1678, 0, ARRAY['summer'], 'community', true
),
(
  'Whistler Train Wreck', 'whistler-train-wreck',
  'A unique short hike to a collection of abandoned boxcars in the forest, covered in colorful graffiti. Crosses a suspension bridge over the Cheakamus River. A local favorite for a quick outing.',
  ARRAY['hiking'], 'green', 'Beginner', 1,
  4000, 60, 60, 620, 580,
  'out_and_back', ARRAY['gravel','boardwalk','dirt'],
  ST_SetSRID(ST_MakePoint(-122.9680, 50.1050), 4326)::geography,
  'Whistler', 'British Columbia', 'Canada', 'CA',
  'open', NOW() - INTERVAL '2 days', false,
  4.3, 2345, 0, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== FINALE LIGURE, ITALY =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Roller Coaster', 'roller-coaster-finale',
  'The classic Finale Ligure enduro trail. A long, technical descent above Finalborgo through rocky Mediterranean singletrack with tight switchbacks, loose corners, and incredible views of the Ligurian Sea. A true test of enduro fitness and skill.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  8050, 61, 580, 650, 70,
  'point_to_point', ARRAY['singletrack','rock','loose'],
  ST_SetSRID(ST_MakePoint(8.3450, 44.1770), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '2 days', false,
  4.8, 1234, 18500, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Cacciatori', 'cacciatori-finale',
  'The hunters'' trail. A steep, rooty descent through dense Mediterranean macchia with tight switchbacks that demand precise bike handling. Roots and rocks keep you on your toes from top to bottom. Intermediate-to-advanced riders only.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  4830, 30, 420, 450, 30,
  'point_to_point', ARRAY['singletrack','roots','rock','dirt'],
  ST_SetSRID(ST_MakePoint(8.3380, 44.1750), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '3 days', false,
  4.6, 876, 12300, ARRAY['spring','fall','winter'], 'community', true
),
(
  'NATO Road / Ex-Militare', 'nato-road-finale',
  'An old military road built along the ridgeline above Finale with spectacular panoramic views of the Ligurian coastline. Moderate difficulty with a mix of gravel, dirt, and some rocky sections. Great for a longer, scenic ride.',
  ARRAY['mtb','hiking'], 'blue', 'Intermediate', 2,
  14500, 305, 610, 720, 110,
  'point_to_point', ARRAY['gravel','dirt','rock'],
  ST_SetSRID(ST_MakePoint(8.3500, 44.1800), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '1 day', false,
  4.5, 654, 8700, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Il Boschetto', 'il-boschetto-finale',
  'A flowing singletrack through ancient olive groves above Finalborgo. Smooth, fast, and fun with sweeping corners and gentle gradients. One of the most enjoyable trails in the region for intermediate riders.',
  ARRAY['mtb'], 'blue', 'Intermediate', 2,
  3220, 15, 260, 280, 20,
  'point_to_point', ARRAY['singletrack','dirt','roots'],
  ST_SetSRID(ST_MakePoint(8.3420, 44.1720), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '2 days', false,
  4.4, 567, 9800, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Bric Scimarco Loop', 'bric-scimarco-loop',
  'A full enduro loop starting from Finale Ligure that climbs to the Bric Scimarco summit for breathtaking Ligurian Sea views before descending on technical rocky trails. One of the signature loops of the region.',
  ARRAY['mtb'], 'black', 'Advanced', 4,
  16100, 730, 730, 750, 20,
  'loop', ARRAY['singletrack','rock','dirt','gravel'],
  ST_SetSRID(ST_MakePoint(8.3435, 44.1693), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '1 day', false,
  4.7, 789, 11200, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Monte Cucco', 'monte-cucco-finale',
  'A technical descent from the hilltop fortress ruins of Castel Gavone through rocky switchbacks and exposed traverses. The upper section has incredible views of the medieval borgo below. Expert line choice required.',
  ARRAY['mtb'], 'double_black', 'Expert', 5,
  3860, 15, 380, 400, 20,
  'point_to_point', ARRAY['rock','singletrack','loose'],
  ST_SetSRID(ST_MakePoint(8.3480, 44.1710), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '3 days', false,
  4.6, 432, 6500, ARRAY['spring','fall','winter'], 'community', true
),
(
  E'Ciap\u00e0 dei C\u00fcni', 'ciapa-dei-cuni-finale',
  'One of the most technical trails in the Finale network. Sustained rocky terrain with tight, exposed lines through Mediterranean scrubland. The name translates roughly to "stone of the rabbits." Expert riders only.',
  ARRAY['mtb'], 'double_black', 'Expert', 5,
  2740, 15, 320, 340, 20,
  'point_to_point', ARRAY['rock','singletrack','loose'],
  ST_SetSRID(ST_MakePoint(8.3550, 44.1740), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '2 days', false,
  4.5, 345, 4500, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Feglino XC Loops', 'feglino-xc-loops',
  'A network of beginner-friendly cross-country loops near the coast in the Feglino valley. Smooth singletrack through pine forest and olive groves with gentle gradients. Perfect for warming up or a recovery ride.',
  ARRAY['mtb','trail_running'], 'green', 'Beginner', 1,
  9660, 183, 183, 200, 30,
  'network', ARRAY['singletrack','dirt','gravel'],
  ST_SetSRID(ST_MakePoint(8.3200, 44.1650), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '1 day', false,
  4.2, 234, 3400, ARRAY['spring','fall','winter'], 'community', true
);

-- --------------------------------------------------------------------------
-- 4. Businesses
-- --------------------------------------------------------------------------

-- ===== MOAB, UTAH =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Poison Spider Bicycles', 'poison-spider-bicycles',
  'Moab''s original mountain bike shop, open since 1989. Full-suspension rentals, expert trail advice, and a mechanic crew that has ridden every line in the valley.',
  'bike_shop', ARRAY['rental','repair','retail'], ARRAY['mtb','road_cycling'],
  '497 N Main St', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.5493, 38.5774), 4326)::geography,
  '+1 435-259-7882', 'info@poisonspiderbicycles.com', 'https://poisonspiderbicycles.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.8, 312, true, 'founding', NOW() + INTERVAL '90 days',
  '15% off multi-day rentals booked through Cairn Connect', NOW() + INTERVAL '45 days',
  true, ARRAY['bike rental','full suspension','trail advice','repairs'], 'seeder', true
),
(
  'Chile Pepper Bike Shop', 'chile-pepper-bike-shop',
  'A Moab staple known for competitive rental pricing, friendly staff, and an excellent selection of parts and accessories. Located right on Main Street with easy access to all major trailheads.',
  'bike_shop', ARRAY['rental','repair','retail'], ARRAY['mtb','road_cycling'],
  '702 S Main St', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.5510, 38.5680), 4326)::geography,
  '+1 435-259-4688', 'info@chilebikes.com', 'https://chilebikes.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.6, 287, true, 'standard', NOW() + INTERVAL '90 days',
  '10% off first-time rentals', NOW() + INTERVAL '30 days',
  true, ARRAY['bike rental','parts','accessories','Main Street'], 'seeder', true
),
(
  'Rim Cyclery', 'rim-cyclery',
  'Family-owned bike shop on Center Street with 30+ years in Moab. Known for hand-built wheels and honest sizing advice. Yeti, Santa Cruz, and Guerrilla Gravity demos available.',
  'bike_shop', ARRAY['rental','repair','retail','demo'], ARRAY['mtb','road_cycling'],
  '94 W 100 N', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.5516, 38.5735), 4326)::geography,
  '+1 435-259-5333', 'shop@rimcyclery.com', 'https://rimcyclery.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.7, 248, true, 'premium', NOW() + INTERVAL '90 days',
  'Free hydration pack with any 3+ day rental', NOW() + INTERVAL '30 days',
  true, ARRAY['demo bikes','wheel building','family-owned'], 'seeder', true
),
(
  'Western Spirit Cycling Adventures', 'western-spirit-cycling',
  'Multi-day guided mountain bike tours through the canyon country of southeast Utah. Fully supported trips with gourmet camping meals, vehicle shuttle, and expert guides who know every route in the region.',
  'guide_service', ARRAY['multi-day tours','mtb touring'], ARRAY['mtb','road_cycling'],
  '478 Mill Creek Dr', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.5420, 38.5690), 4326)::geography,
  '+1 435-259-8732', 'ride@westernspirit.com', 'https://westernspirit.com',
  '{"monday":"8:00 AM - 5:00 PM","tuesday":"8:00 AM - 5:00 PM","wednesday":"8:00 AM - 5:00 PM","thursday":"8:00 AM - 5:00 PM","friday":"8:00 AM - 5:00 PM","saturday":"Closed","sunday":"Closed"}'::jsonb,
  4.9, 198, true, 'standard', NOW() + INTERVAL '90 days',
  NULL, NULL,
  true, ARRAY['multi-day tours','White Rim','Kokopelli','gourmet camping'], 'seeder', true
),
(
  'Moab Adventure Center', 'moab-adventure-center',
  'Moab''s largest outfitter offering rafting, canyoneering, 4x4 tours, scenic flights, and rock climbing. One-stop booking for every adventure in the area. Located on Main Street.',
  'outfitter', ARRAY['rafting','canyoneering','4x4','scenic flights','climbing'], ARRAY['kayaking','climbing','hiking'],
  '225 S Main St', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.5500, 38.5710), 4326)::geography,
  '+1 435-259-7019', 'info@moabadventurecenter.com', 'https://moabadventurecenter.com',
  '{"monday":"7:00 AM - 8:00 PM","tuesday":"7:00 AM - 8:00 PM","wednesday":"7:00 AM - 8:00 PM","thursday":"7:00 AM - 8:00 PM","friday":"7:00 AM - 9:00 PM","saturday":"7:00 AM - 9:00 PM","sunday":"7:00 AM - 8:00 PM"}'::jsonb,
  4.7, 456, false, NULL, NULL,
  '$25 off any full-day activity booked online', NOW() + INTERVAL '60 days',
  true, ARRAY['rafting','canyoneering','one-stop booking','Main Street'], 'seeder', true
),
(
  'Red Cliffs Lodge', 'red-cliffs-lodge',
  'A riverside resort on Highway 128 with stunning views of the Colorado River and towering red cliffs. Spacious cabins, on-site winery, horseback riding, and a private beach. Mountain bike and hiking trail access from the property.',
  'lodge', ARRAY['resort','restaurant','winery'], ARRAY['hiking','mtb','horseback'],
  'Mile 14, Hwy 128', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.4100, 38.6200), 4326)::geography,
  '+1 435-259-2002', 'info@redcliffslodge.com', 'https://redcliffslodge.com',
  '{"monday":"24 hours","tuesday":"24 hours","wednesday":"24 hours","thursday":"24 hours","friday":"24 hours","saturday":"24 hours","sunday":"24 hours"}'::jsonb,
  4.6, 567, true, 'premium', NOW() + INTERVAL '90 days',
  '10% off stays booked through Cairn Connect', NOW() + INTERVAL '60 days',
  true, ARRAY['riverside','winery','horseback','Colorado River','cabins'], 'seeder', true
),
(
  'Sorrel River Ranch Resort', 'sorrel-river-ranch',
  'A luxury ranch resort on the banks of the Colorado River surrounded by towering red rock formations. Spa, horseback riding, archery, and farm-to-table dining. A world-class basecamp for Moab adventures.',
  'lodge', ARRAY['resort','spa','restaurant'], ARRAY['hiking','horseback','kayaking'],
  'Mile 17, Hwy 128', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.3800, 38.6400), 4326)::geography,
  '+1 435-259-4642', 'info@sorrelriver.com', 'https://sorrelriver.com',
  '{"monday":"24 hours","tuesday":"24 hours","wednesday":"24 hours","thursday":"24 hours","friday":"24 hours","saturday":"24 hours","sunday":"24 hours"}'::jsonb,
  4.8, 312, false, NULL, NULL, NULL, NULL,
  true, ARRAY['luxury','spa','horseback','Colorado River','farm-to-table'], 'seeder', true
),
(
  'Coyote Shuttle', 'coyote-shuttle',
  'Reliable bike and hiker shuttle service covering every major trailhead in the Moab area. Porcupine Rim, Whole Enchilada, Kokopelli -- they run them all.',
  'shuttle_service', ARRAY['trailhead shuttle','airport transfer'], ARRAY['mtb','hiking','trail_running'],
  '197 S Main St', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.5502, 38.5701), 4326)::geography,
  '+1 435-260-2227', 'rides@coyoteshuttle.com', 'https://coyoteshuttle.com',
  '{"monday":"6:00 AM - 7:00 PM","tuesday":"6:00 AM - 7:00 PM","wednesday":"6:00 AM - 7:00 PM","thursday":"6:00 AM - 7:00 PM","friday":"6:00 AM - 8:00 PM","saturday":"5:30 AM - 8:00 PM","sunday":"5:30 AM - 7:00 PM"}'::jsonb,
  4.6, 134, false, NULL, NULL,
  '10% off Whole Enchilada shuttles on weekdays', NOW() + INTERVAL '21 days',
  true, ARRAY['bike shuttle','Porcupine Rim','Whole Enchilada'], 'seeder', true
);

-- ===== PARK CITY, UTAH =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'White Pine Touring', 'white-pine-touring',
  'Park City''s Nordic and mountain bike headquarters. Full-suspension rentals, XC ski gear, and expert staff who know the 450+ miles of trails in the area. Ride guides and skills clinics available.',
  'bike_shop', ARRAY['rental','repair','retail','nordic ski'], ARRAY['mtb','nordic_skiing','road_cycling'],
  '1790 Bonanza Dr', 'Park City', 'Utah', 'United States', 'US', '84060',
  ST_SetSRID(ST_MakePoint(-111.4950, 40.6600), 4326)::geography,
  '+1 435-649-8710', 'info@whitepinetouring.com', 'https://whitepinetouring.com',
  '{"monday":"9:00 AM - 6:00 PM","tuesday":"9:00 AM - 6:00 PM","wednesday":"9:00 AM - 6:00 PM","thursday":"9:00 AM - 6:00 PM","friday":"9:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.7, 345, true, 'founding', NOW() + INTERVAL '90 days',
  'Free trail map with any rental booking', NOW() + INTERVAL '30 days',
  true, ARRAY['bike rental','Nordic center','trail experts','skills clinics'], 'seeder', true
),
(
  'Jans Mountain Outfitters', 'jans-mountain-outfitters',
  'A Park City institution since 1973. Full-service outdoor gear shop with ski, bike, and hiking equipment. Expert boot fitting and bike sizing. Demo programs available.',
  'outfitter', ARRAY['rental','retail','ski','bike'], ARRAY['mtb','skiing','hiking','snowboarding'],
  '1600 Park Ave', 'Park City', 'Utah', 'United States', 'US', '84060',
  ST_SetSRID(ST_MakePoint(-111.4980, 40.6550), 4326)::geography,
  '+1 435-649-4949', 'info@jans.com', 'https://jans.com',
  '{"monday":"9:00 AM - 7:00 PM","tuesday":"9:00 AM - 7:00 PM","wednesday":"9:00 AM - 7:00 PM","thursday":"9:00 AM - 7:00 PM","friday":"9:00 AM - 8:00 PM","saturday":"8:00 AM - 8:00 PM","sunday":"9:00 AM - 6:00 PM"}'::jsonb,
  4.6, 567, true, 'premium', NOW() + INTERVAL '90 days',
  NULL, NULL,
  true, ARRAY['since 1973','boot fitting','demo bikes','ski rental'], 'seeder', true
),
(
  'Park City Mountain Resort', 'park-city-mountain-resort',
  'The largest ski resort in the United States with over 7,300 acres. Summer operations include lift-served mountain biking, alpine coaster, and hiking. The bike park has trails for all levels.',
  'ski_resort', ARRAY['ski resort','bike park','lift access'], ARRAY['skiing','snowboarding','mtb','hiking'],
  '1345 Lowell Ave', 'Park City', 'Utah', 'United States', 'US', '84060',
  ST_SetSRID(ST_MakePoint(-111.5080, 40.6514), 4326)::geography,
  '+1 435-649-8111', 'info@parkcitymountain.com', 'https://parkcitymountain.com',
  '{"monday":"9:00 AM - 4:30 PM","tuesday":"9:00 AM - 4:30 PM","wednesday":"9:00 AM - 4:30 PM","thursday":"9:00 AM - 4:30 PM","friday":"9:00 AM - 4:30 PM","saturday":"9:00 AM - 4:30 PM","sunday":"9:00 AM - 4:30 PM"}'::jsonb,
  4.5, 2345, false, NULL, NULL, NULL, NULL,
  true, ARRAY['largest US resort','bike park','alpine coaster','lift-served'], 'seeder', true
),
(
  'Deer Valley Resort', 'deer-valley-resort',
  'A luxury ski resort renowned for immaculate grooming and limited skier numbers. Summer hiking on manicured trails with wildflower meadows and scenic chairlift rides. No mountain biking on-resort.',
  'ski_resort', ARRAY['ski resort','hiking','chairlift rides'], ARRAY['skiing','hiking'],
  '2250 Deer Valley Dr S', 'Park City', 'Utah', 'United States', 'US', '84060',
  ST_SetSRID(ST_MakePoint(-111.4780, 40.6370), 4326)::geography,
  '+1 435-649-1000', 'info@deervalley.com', 'https://deervalley.com',
  '{"monday":"9:00 AM - 4:30 PM","tuesday":"9:00 AM - 4:30 PM","wednesday":"9:00 AM - 4:30 PM","thursday":"9:00 AM - 4:30 PM","friday":"9:00 AM - 4:30 PM","saturday":"9:00 AM - 4:30 PM","sunday":"9:00 AM - 4:30 PM"}'::jsonb,
  4.8, 1890, false, NULL, NULL, NULL, NULL,
  true, ARRAY['luxury','groomed','limited tickets','scenic chairlift'], 'seeder', true
);

-- ===== ST. GEORGE / HURRICANE, UTAH =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Red Rock Bicycle Co.', 'red-rock-bicycle-co',
  'St. George''s premier mountain bike shop. Full-suspension and hardtail rentals, expert mechanics, and staff who ride the local trails year-round. Gooseberry Mesa shuttle service available.',
  'bike_shop', ARRAY['rental','repair','retail','shuttle'], ARRAY['mtb','road_cycling'],
  '446 W 100 S', 'St. George', 'Utah', 'United States', 'US', '84770',
  ST_SetSRID(ST_MakePoint(-113.5850, 37.1060), 4326)::geography,
  '+1 435-674-3185', 'info@redrockbicycle.com', 'https://redrockbicycle.com',
  '{"monday":"9:00 AM - 6:00 PM","tuesday":"9:00 AM - 6:00 PM","wednesday":"9:00 AM - 6:00 PM","thursday":"9:00 AM - 6:00 PM","friday":"9:00 AM - 7:00 PM","saturday":"9:00 AM - 7:00 PM","sunday":"10:00 AM - 4:00 PM"}'::jsonb,
  4.7, 234, true, 'founding', NOW() + INTERVAL '90 days',
  'Free Gooseberry shuttle with 3-day rental', NOW() + INTERVAL '45 days',
  true, ARRAY['bike rental','Gooseberry shuttle','year-round riding'], 'seeder', true
),
(
  'Over the Edge Sports', 'over-the-edge-hurricane',
  'The go-to shop in Hurricane for mountain biking. Located right at the gateway to Gooseberry Mesa and the Hurricane Cliffs trails. Rentals, repairs, and local beta from riders who live here.',
  'bike_shop', ARRAY['rental','repair','retail'], ARRAY['mtb'],
  '76 E 100 S', 'Hurricane', 'Utah', 'United States', 'US', '84737',
  ST_SetSRID(ST_MakePoint(-113.2890, 37.1750), 4326)::geography,
  '+1 435-635-5455', 'ride@overtheedgesports.com', 'https://overtheedgesports.com',
  '{"monday":"9:00 AM - 6:00 PM","tuesday":"9:00 AM - 6:00 PM","wednesday":"9:00 AM - 6:00 PM","thursday":"9:00 AM - 6:00 PM","friday":"9:00 AM - 6:00 PM","saturday":"8:00 AM - 6:00 PM","sunday":"10:00 AM - 4:00 PM"}'::jsonb,
  4.6, 189, true, 'standard', NOW() + INTERVAL '90 days',
  NULL, NULL,
  true, ARRAY['Gooseberry Mesa','Hurricane Cliffs','local knowledge'], 'seeder', true
);

-- ===== ZION / SPRINGDALE =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Zion Adventure Company', 'zion-adventure-company',
  'Springdale''s premier outfitter for Zion National Park adventures. Guided canyoneering, rock climbing, and hiking trips. Gear rental for the Narrows including dry suits, boots, and trekking poles.',
  'outfitter', ARRAY['canyoneering','climbing','gear rental','guided hikes'], ARRAY['hiking','climbing','canyoneering'],
  '36 Lion Blvd', 'Springdale', 'Utah', 'United States', 'US', '84767',
  ST_SetSRID(ST_MakePoint(-112.9980, 37.1890), 4326)::geography,
  '+1 435-772-1001', 'info@zionadventures.com', 'https://zionadventures.com',
  '{"monday":"7:00 AM - 8:00 PM","tuesday":"7:00 AM - 8:00 PM","wednesday":"7:00 AM - 8:00 PM","thursday":"7:00 AM - 8:00 PM","friday":"7:00 AM - 9:00 PM","saturday":"6:00 AM - 9:00 PM","sunday":"6:00 AM - 8:00 PM"}'::jsonb,
  4.8, 567, true, 'founding', NOW() + INTERVAL '90 days',
  '15% off Narrows gear rental packages', NOW() + INTERVAL '45 days',
  true, ARRAY['Narrows gear','canyoneering','Zion guides','rock climbing'], 'seeder', true
);

-- ===== SALT LAKE CITY, UTAH =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Contender Bicycles', 'contender-bicycles',
  'A high-end bike shop in the heart of Salt Lake City with road, mountain, and gravel bikes. Expert fitting services and a knowledgeable staff passionate about the Wasatch riding scene.',
  'bike_shop', ARRAY['retail','repair','fitting'], ARRAY['mtb','road_cycling'],
  '989 E 900 S', 'Salt Lake City', 'Utah', 'United States', 'US', '84105',
  ST_SetSRID(ST_MakePoint(-111.8700, 40.7500), 4326)::geography,
  '+1 801-364-0344', 'info@contenderbicycles.com', 'https://contenderbicycles.com',
  '{"monday":"10:00 AM - 6:00 PM","tuesday":"10:00 AM - 6:00 PM","wednesday":"10:00 AM - 6:00 PM","thursday":"10:00 AM - 6:00 PM","friday":"10:00 AM - 7:00 PM","saturday":"9:00 AM - 6:00 PM","sunday":"11:00 AM - 5:00 PM"}'::jsonb,
  4.7, 312, false, NULL, NULL, NULL, NULL,
  true, ARRAY['high-end','fitting','Wasatch riding','gravel'], 'seeder', true
),
(
  'REI Salt Lake City', 'rei-salt-lake-city',
  'The flagship REI store in Utah. Massive selection of outdoor gear for every activity from skiing to kayaking. Expert advice, gear rental, and regular community events and workshops.',
  'outfitter', ARRAY['retail','rental','workshops'], ARRAY['hiking','mtb','skiing','climbing','kayaking','camping'],
  '3285 E 3300 S', 'Salt Lake City', 'Utah', 'United States', 'US', '84109',
  ST_SetSRID(ST_MakePoint(-111.8200, 40.7000), 4326)::geography,
  '+1 801-486-2100', 'info@rei.com', 'https://rei.com/stores/salt-lake-city',
  '{"monday":"10:00 AM - 9:00 PM","tuesday":"10:00 AM - 9:00 PM","wednesday":"10:00 AM - 9:00 PM","thursday":"10:00 AM - 9:00 PM","friday":"10:00 AM - 9:00 PM","saturday":"9:00 AM - 9:00 PM","sunday":"10:00 AM - 7:00 PM"}'::jsonb,
  4.5, 890, false, NULL, NULL, NULL, NULL,
  true, ARRAY['outdoor gear','rental','workshops','community events'], 'seeder', true
);

-- ===== BEND, OREGON =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Pine Mountain Sports', 'pine-mountain-sports',
  'Bend''s go-to bike shop for trail recommendations and quality rentals. Staff rides daily and knows every connector in the Phil''s Trail network. Full suspension and e-bike rentals available.',
  'bike_shop', ARRAY['rental','repair','retail'], ARRAY['mtb','road_cycling','nordic_skiing'],
  '255 SW Century Dr', 'Bend', 'Oregon', 'United States', 'US', '97702',
  ST_SetSRID(ST_MakePoint(-121.3258, 44.0542), 4326)::geography,
  '+1 541-385-8080', 'info@pinemountainsports.com', 'https://pinemountainsports.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.7, 423, true, 'founding', NOW() + INTERVAL '90 days',
  'Free trail map with any rental', NOW() + INTERVAL '30 days',
  true, ARRAY['bike rental','e-bikes','trail maps','Phil''s Trail experts'], 'seeder', true
),
(
  'Cog Wild Mountain Bike Tours', 'cog-wild-mountain-bike-tours',
  'Guided mountain bike tours through Bend''s best trails. Half-day, full-day, and multi-day backcountry MTB trips. Perfect for riders who want local knowledge and curated routes.',
  'guide_service', ARRAY['mtb tours','skills clinics'], ARRAY['mtb'],
  '19221 SW Century Dr', 'Bend', 'Oregon', 'United States', 'US', '97702',
  ST_SetSRID(ST_MakePoint(-121.3420, 44.0380), 4326)::geography,
  '+1 541-385-7002', 'ride@cogwild.com', 'https://cogwild.com',
  '{"monday":"7:00 AM - 8:00 PM","tuesday":"7:00 AM - 8:00 PM","wednesday":"7:00 AM - 8:00 PM","thursday":"7:00 AM - 8:00 PM","friday":"7:00 AM - 8:00 PM","saturday":"6:00 AM - 9:00 PM","sunday":"6:00 AM - 9:00 PM"}'::jsonb,
  4.9, 267, true, 'standard', NOW() + INTERVAL '90 days', NULL, NULL,
  true, ARRAY['guided MTB','skills clinic','backcountry','local knowledge'], 'seeder', true
),
(
  'Paulina Plunge', 'paulina-plunge',
  'A guided downhill mountain bike adventure descending 2,500 feet from the rim of Newberry Volcanic Monument to Paulina Lake. Includes shuttle, bikes, and guides. An unforgettable Bend experience.',
  'guide_service', ARRAY['guided downhill','shuttle'], ARRAY['mtb'],
  '61535 S Hwy 97', 'Bend', 'Oregon', 'United States', 'US', '97702',
  ST_SetSRID(ST_MakePoint(-121.3100, 43.9800), 4326)::geography,
  '+1 541-389-0562', 'info@paulinaplunge.com', 'https://paulinaplunge.com',
  '{"monday":"8:00 AM - 5:00 PM","tuesday":"8:00 AM - 5:00 PM","wednesday":"8:00 AM - 5:00 PM","thursday":"8:00 AM - 5:00 PM","friday":"8:00 AM - 5:00 PM","saturday":"7:00 AM - 5:00 PM","sunday":"7:00 AM - 5:00 PM"}'::jsonb,
  4.8, 345, false, NULL, NULL,
  '$10 off when you mention Cairn Connect', NOW() + INTERVAL '30 days',
  true, ARRAY['downhill','Newberry','shuttle','guided experience'], 'seeder', true
);

-- ===== SEDONA, ARIZONA =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Thunder Mountain Bikes', 'thunder-mountain-bikes',
  'Sedona''s original mountain bike shop with deep knowledge of every trail in the red rock country. Premium rentals, expert tune-ups, and guided rides. Located in West Sedona near major trailheads.',
  'bike_shop', ARRAY['rental','repair','retail','guided rides'], ARRAY['mtb'],
  '1695 W Hwy 89A', 'Sedona', 'Arizona', 'United States', 'US', '86336',
  ST_SetSRID(ST_MakePoint(-111.7820, 34.8780), 4326)::geography,
  '+1 928-282-1106', 'info@thundermountainbikes.com', 'https://thundermountainbikes.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.8, 456, true, 'founding', NOW() + INTERVAL '90 days',
  'Free trail snacks with any full-day rental', NOW() + INTERVAL '30 days',
  true, ARRAY['bike rental','guided rides','red rock trails','e-bikes'], 'seeder', true
),
(
  'Sedona Bike & Bean', 'sedona-bike-and-bean',
  'A unique combination bike shop and coffee bar. Rent a bike, grab an espresso, and hit the trails. Repair services, trail advice, and a relaxed vibe that captures the Sedona spirit.',
  'bike_shop', ARRAY['rental','repair','coffee'], ARRAY['mtb'],
  '35 Ranger Rd', 'Sedona', 'Arizona', 'United States', 'US', '86336',
  ST_SetSRID(ST_MakePoint(-111.7650, 34.8700), 4326)::geography,
  '+1 928-284-0210', 'info@bikeandbean.com', 'https://bikeandbean.com',
  '{"monday":"7:00 AM - 5:00 PM","tuesday":"7:00 AM - 5:00 PM","wednesday":"7:00 AM - 5:00 PM","thursday":"7:00 AM - 5:00 PM","friday":"7:00 AM - 6:00 PM","saturday":"7:00 AM - 6:00 PM","sunday":"8:00 AM - 4:00 PM"}'::jsonb,
  4.6, 312, false, NULL, NULL,
  'Free coffee with any bike rental', NOW() + INTERVAL '30 days',
  true, ARRAY['bike rental','coffee','chill vibes','trail advice'], 'seeder', true
);

-- ===== LAKE TAHOE, CA/NV =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Flume Trail Bikes', 'flume-trail-bikes',
  'The only bike shop at the Flume Trail trailhead. Full-suspension rentals optimized for the Flume and shuttle service to the top. Staff knows every section of the Tahoe Rim Trail.',
  'bike_shop', ARRAY['rental','shuttle'], ARRAY['mtb'],
  '1115 Tunnel Creek Rd', 'Incline Village', 'Nevada', 'United States', 'US', '89451',
  ST_SetSRID(ST_MakePoint(-119.9060, 39.2020), 4326)::geography,
  '+1 775-298-2501', 'ride@flumetrailbikes.com', 'https://flumetrailbikes.com',
  '{"monday":"8:00 AM - 5:00 PM","tuesday":"8:00 AM - 5:00 PM","wednesday":"8:00 AM - 5:00 PM","thursday":"8:00 AM - 5:00 PM","friday":"8:00 AM - 6:00 PM","saturday":"7:30 AM - 6:00 PM","sunday":"7:30 AM - 5:00 PM"}'::jsonb,
  4.7, 345, true, 'founding', NOW() + INTERVAL '90 days',
  'Shuttle + rental combo saves $20', NOW() + INTERVAL '30 days',
  true, ARRAY['Flume Trail','shuttle','mountain bikes','Tahoe Rim Trail'], 'seeder', true
),
(
  'Olympic Bike Shop', 'olympic-bike-shop',
  'A Tahoe City institution serving the North Shore riding community. Road, mountain, and e-bike rentals. Experienced mechanics and friendly staff who ride the local trails daily.',
  'bike_shop', ARRAY['rental','repair','retail'], ARRAY['mtb','road_cycling'],
  '620 N Lake Blvd', 'Tahoe City', 'California', 'United States', 'US', '96145',
  ST_SetSRID(ST_MakePoint(-120.1430, 39.1680), 4326)::geography,
  '+1 530-581-2500', 'info@olympicbikeshop.com', 'https://olympicbikeshop.com',
  '{"monday":"9:00 AM - 6:00 PM","tuesday":"9:00 AM - 6:00 PM","wednesday":"9:00 AM - 6:00 PM","thursday":"9:00 AM - 6:00 PM","friday":"9:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.5, 234, false, NULL, NULL, NULL, NULL,
  true, ARRAY['North Shore','Tahoe City','e-bikes','road bikes'], 'seeder', true
),
(
  'Tahoe Adventure Company', 'tahoe-adventure-company',
  'Multi-sport outfitter offering guided hikes, kayak tours of Emerald Bay, SUP lessons, and winter snowshoe treks. All gear included with guided trips.',
  'guide_service', ARRAY['hiking','kayak tours','SUP','snowshoe'], ARRAY['hiking','kayaking','standup_paddle','snowshoeing'],
  '10065 West River St', 'Truckee', 'California', 'United States', 'US', '96161',
  ST_SetSRID(ST_MakePoint(-120.1831, 39.3262), 4326)::geography,
  '+1 530-913-9212', 'info@tahoeadventurecompany.com', 'https://tahoeadventurecompany.com',
  '{"monday":"7:00 AM - 8:00 PM","tuesday":"7:00 AM - 8:00 PM","wednesday":"7:00 AM - 8:00 PM","thursday":"7:00 AM - 8:00 PM","friday":"7:00 AM - 8:00 PM","saturday":"6:00 AM - 9:00 PM","sunday":"6:00 AM - 9:00 PM"}'::jsonb,
  4.8, 412, true, 'premium', NOW() + INTERVAL '90 days', NULL, NULL,
  true, ARRAY['guided hikes','kayak tours','Emerald Bay','SUP lessons','snowshoe'], 'seeder', true
);

-- ===== WHISTLER, BC =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, currency, source, is_active)
VALUES
(
  'Whistler Mountain Bike Park', 'whistler-mountain-bike-park',
  'The most famous mountain bike park on Earth. Over 80 trails from beginner flow to world-class downhill. Lift-served descents on Whistler Mountain with jump trails, tech trails, and everything in between.',
  'bike_shop', ARRAY['bike park','lift access','rental'], ARRAY['mtb'],
  '4545 Blackcomb Way', 'Whistler', 'British Columbia', 'Canada', 'CA', 'V8E 0X9',
  ST_SetSRID(ST_MakePoint(-122.9530, 50.1140), 4326)::geography,
  '+1 604-967-8950', 'info@whistlerblackcomb.com', 'https://www.whistlerblackcomb.com/explore-the-resort/activities-and-events/mountain-biking',
  '{"monday":"10:00 AM - 5:00 PM","tuesday":"10:00 AM - 5:00 PM","wednesday":"10:00 AM - 5:00 PM","thursday":"10:00 AM - 5:00 PM","friday":"10:00 AM - 5:00 PM","saturday":"10:00 AM - 5:00 PM","sunday":"10:00 AM - 5:00 PM"}'::jsonb,
  4.9, 3456, true, 'founding', NOW() + INTERVAL '90 days',
  NULL, NULL,
  true, ARRAY['bike park','lift-served','world-class','80+ trails'], 'CAD', 'seeder', true
),
(
  'Arbutus Routes', 'arbutus-routes',
  'Guided mountain bike experiences throughout the Sea-to-Sky corridor. Cross-country epics, enduro descents, and skills coaching. Small group sizes with PMBI-certified instructors.',
  'guide_service', ARRAY['guided rides','skills coaching','enduro tours'], ARRAY['mtb'],
  '4293 Mountain Square', 'Whistler', 'British Columbia', 'Canada', 'CA', 'V8E 1B8',
  ST_SetSRID(ST_MakePoint(-122.9560, 50.1150), 4326)::geography,
  '+1 604-938-0022', 'ride@arbutusroutes.com', 'https://arbutusroutes.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"7:00 AM - 7:00 PM","sunday":"8:00 AM - 6:00 PM"}'::jsonb,
  4.8, 234, true, 'standard', NOW() + INTERVAL '90 days',
  '10% off multi-day guided packages', NOW() + INTERVAL '45 days',
  true, ARRAY['guided rides','PMBI certified','Sea-to-Sky','skills coaching'], 'CAD', 'seeder', true
),
(
  'Fanatyk Co. Ski & Cycle', 'fanatyk-co-ski-cycle',
  'Whistler Village''s premier bike and ski shop. Expert bike park tune-ups, downhill rentals, and a knowledgeable staff that rides or skis daily.',
  'bike_shop', ARRAY['rental','repair','retail','ski'], ARRAY['mtb','skiing','snowboarding'],
  '4433 Sundial Place', 'Whistler', 'British Columbia', 'Canada', 'CA', 'V8E 1G8',
  ST_SetSRID(ST_MakePoint(-122.9575, 50.1145), 4326)::geography,
  '+1 604-938-9455', 'info@fanatykco.com', 'https://fanatykco.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.8, 567, false, NULL, NULL,
  '20% off bike park rentals for 3+ day bookings', NOW() + INTERVAL '30 days',
  true, ARRAY['bike park rentals','downhill','ski shop','expert tune-ups'], 'CAD', 'seeder', true
);

-- ===== FINALE LIGURE, ITALY =====

INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, currency, source, is_active)
VALUES
(
  'Finale Freeride', 'finale-freeride',
  'The original Finale Ligure bike service. Rentals from hardtails to full-enduro rigs, guided tours with local riders, and shuttle service to every trailhead. Located in the heart of Finalborgo near the medieval gate.',
  'bike_shop', ARRAY['rental','guided tours','shuttle'], ARRAY['mtb'],
  'Via Pertica 12', 'Finale Ligure', 'Liguria', 'Italy', 'IT', '17024',
  ST_SetSRID(ST_MakePoint(8.3435, 44.1693), 4326)::geography,
  '+39 019-690065', 'info@finalefreeride.com', 'https://finalefreeride.com',
  '{"monday":"8:30 AM - 6:30 PM","tuesday":"8:30 AM - 6:30 PM","wednesday":"8:30 AM - 6:30 PM","thursday":"8:30 AM - 6:30 PM","friday":"8:30 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"8:00 AM - 6:00 PM"}'::jsonb,
  4.8, 567, true, 'founding', NOW() + INTERVAL '90 days',
  '15% off multi-day rental packages for Cairn Connect users', NOW() + INTERVAL '60 days',
  true, ARRAY['enduro rental','shuttle service','guided tours','Finalborgo'], 'EUR', 'seeder', true
),
(
  'MtbCult Finale', 'mtbcult-finale',
  'Professional MTB rental and touring service in Finale Ligure. High-end enduro and e-bike rentals, multi-day guided tours, and airport transfer service from Genoa and Nice airports.',
  'gear_rental', ARRAY['rental','guided tours','airport transfer'], ARRAY['mtb'],
  'Via Brunenghi 48', 'Finale Ligure', 'Liguria', 'Italy', 'IT', '17024',
  ST_SetSRID(ST_MakePoint(8.3410, 44.1680), 4326)::geography,
  '+39 019-680321', 'info@mtbcult.it', 'https://mtbcult.it',
  '{"monday":"9:00 AM - 6:00 PM","tuesday":"9:00 AM - 6:00 PM","wednesday":"9:00 AM - 6:00 PM","thursday":"9:00 AM - 6:00 PM","friday":"9:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"8:00 AM - 6:00 PM"}'::jsonb,
  4.7, 345, true, 'standard', NOW() + INTERVAL '90 days',
  'Free airport pickup with 5+ day rental', NOW() + INTERVAL '45 days',
  true, ARRAY['e-bike rental','airport transfer','multi-day tours','high-end bikes'], 'EUR', 'seeder', true
),
(
  'Ride Finale', 'ride-finale',
  'Guided enduro and e-bike tours through the Finale trail network. Small groups led by local riders who know every hidden trail. E-bike rentals available for riders who want to explore more terrain with less climbing.',
  'guide_service', ARRAY['guided tours','e-bike rental'], ARRAY['mtb'],
  'Via Calice 15', 'Finale Ligure', 'Liguria', 'Italy', 'IT', '17024',
  ST_SetSRID(ST_MakePoint(8.3460, 44.1700), 4326)::geography,
  '+39 333-456-7890', 'info@ridefinale.com', 'https://ridefinale.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"7:30 AM - 7:00 PM","sunday":"8:00 AM - 6:00 PM"}'::jsonb,
  4.7, 234, false, NULL, NULL,
  '10% off guided tours booked 2+ weeks in advance', NOW() + INTERVAL '60 days',
  true, ARRAY['guided enduro','e-bike tours','local guides','small groups'], 'EUR', 'seeder', true
),
(
  'Hotel Florenz', 'hotel-florenz-finale',
  'A bike-friendly hotel in the center of Finale Ligure with a dedicated bike wash station, secure storage, and a workshop area. The restaurant serves traditional Ligurian cuisine. Steps from the beach and the trails.',
  'lodge', ARRAY['hotel','restaurant','bike storage'], ARRAY['mtb','hiking'],
  'Via Colombo 3', 'Finale Ligure', 'Liguria', 'Italy', 'IT', '17024',
  ST_SetSRID(ST_MakePoint(8.3440, 44.1690), 4326)::geography,
  '+39 019-692567', 'info@hotelflorenz.it', 'https://hotelflorenz.it',
  '{"monday":"24 hours","tuesday":"24 hours","wednesday":"24 hours","thursday":"24 hours","friday":"24 hours","saturday":"24 hours","sunday":"24 hours"}'::jsonb,
  4.5, 189, false, NULL, NULL,
  'Free packed lunch for riders on multi-night stays', NOW() + INTERVAL '45 days',
  true, ARRAY['bike-friendly','wash station','Ligurian cuisine','beachfront'], 'EUR', 'seeder', true
),
(
  'B&B Il Rosmarino', 'bb-il-rosmarino',
  'A cozy MTB-friendly bed and breakfast in the hills above Finalborgo. Stunning views of the Mediterranean, homemade breakfast with local produce, and a friendly host who rides the trails daily.',
  'lodge', ARRAY['bed and breakfast','bike storage'], ARRAY['mtb','hiking'],
  'Via dei Colli 22', 'Finale Ligure', 'Liguria', 'Italy', 'IT', '17024',
  ST_SetSRID(ST_MakePoint(8.3470, 44.1720), 4326)::geography,
  '+39 019-693445', 'info@ilrosmarino.it', 'https://ilrosmarino.it',
  '{"monday":"24 hours","tuesday":"24 hours","wednesday":"24 hours","thursday":"24 hours","friday":"24 hours","saturday":"24 hours","sunday":"24 hours"}'::jsonb,
  4.7, 123, false, NULL, NULL, NULL, NULL,
  true, ARRAY['B&B','hilltop views','homemade breakfast','rider-friendly'], 'EUR', 'seeder', true
),
(
  'Camping Tahiti', 'camping-tahiti-finale',
  'A popular campground near the coast and close to the trailheads. Tent sites, bungalows, and mobile homes. Bike wash, secure storage, and a small shop. Great social scene with riders from all over Europe.',
  'campground', ARRAY['camping','bungalows','bike storage'], ARRAY['mtb','hiking','camping'],
  'Via Varese 1', 'Finale Ligure', 'Liguria', 'Italy', 'IT', '17024',
  ST_SetSRID(ST_MakePoint(8.3380, 44.1660), 4326)::geography,
  '+39 019-600600', 'info@campingtahiti.it', 'https://campingtahiti.it',
  '{"monday":"8:00 AM - 10:00 PM","tuesday":"8:00 AM - 10:00 PM","wednesday":"8:00 AM - 10:00 PM","thursday":"8:00 AM - 10:00 PM","friday":"8:00 AM - 10:00 PM","saturday":"8:00 AM - 10:00 PM","sunday":"8:00 AM - 10:00 PM"}'::jsonb,
  4.3, 267, false, NULL, NULL, NULL, NULL,
  true, ARRAY['camping','bungalows','bike wash','near trails','social'], 'EUR', 'seeder', true
);

-- ===== ADDITIONAL MOAB TRAILS =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Moab Brand Trails - Lazy', 'moab-brand-lazy',
  'A mellow beginner loop in the Moab Brand network north of town. Flat, smooth singletrack through open desert with gentle curves and good sight lines. Ideal for families and first-time desert riders.',
  ARRAY['mtb','hiking'], 'green', 'Beginner', 1,
  6440, 30, 30, 1341, 1310,
  'loop', ARRAY['singletrack','dirt','sand'],
  ST_SetSRID(ST_MakePoint(-109.6050, 38.6350), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.0, 234, 4200, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Moab Brand Trails - Circle O', 'moab-brand-circle-o',
  'An intermediate loop in the Moab Brand network with more varied terrain than Lazy. Some rocky sections and short climbs add challenge. Great views of the Colorado River corridor to the south.',
  ARRAY['mtb'], 'blue', 'Intermediate', 2,
  9660, 122, 122, 1372, 1310,
  'loop', ARRAY['singletrack','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-109.6020, 38.6380), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.2, 312, 5600, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Copper Ridge Sauropod Trackway', 'copper-ridge-trackway',
  'A short interpretive trail to one of the best-preserved dinosaur trackways in the Southwest. Over 200 sauropod and theropod tracks are visible in the sandstone. Educational signs explain the ancient environment.',
  ARRAY['hiking'], 'green', 'Beginner', 1,
  1610, 15, 15, 1402, 1390,
  'out_and_back', ARRAY['dirt','sandstone'],
  ST_SetSRID(ST_MakePoint(-109.6700, 38.7600), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.3, 456, 0, ARRAY['spring','fall','winter'], 'community', true
);

-- ===== ADDITIONAL PARK CITY TRAILS =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Rob''s Trail', 'robs-trail',
  'A fast, flowy descent through aspens and scrub oak in Round Valley. Well-built berms and tabletops make it a favorite for Park City locals. One of the best intermediate descents in the area.',
  ARRAY['mtb'], 'blue', 'Intermediate', 3,
  4830, 15, 244, 2200, 1980,
  'point_to_point', ARRAY['singletrack','dirt'],
  ST_SetSRID(ST_MakePoint(-111.4920, 40.6700), 4326)::geography,
  'Park City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.6, 567, 8900, ARRAY['summer','fall'], 'community', true
),
(
  'Round Valley Loop', 'round-valley-loop',
  'A gentle rolling loop through the Round Valley open space just outside Park City. Wide, smooth trails with mountain views and wildflowers in summer. Perfect for beginners and families.',
  ARRAY['mtb','hiking','trail_running'], 'green', 'Beginner', 1,
  8050, 122, 122, 2100, 2010,
  'loop', ARRAY['singletrack','dirt','gravel'],
  ST_SetSRID(ST_MakePoint(-111.4890, 40.6750), 4326)::geography,
  'Park City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.3, 345, 5600, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== ADDITIONAL SLC / WASATCH TRAILS =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Grandeur Peak', 'grandeur-peak',
  'A classic Wasatch peak hike directly accessible from the Salt Lake City metro area. Steep and sustained with a scrambly finish to the 8,299-foot summit. Panoramic views from the top of the entire valley.',
  ARRAY['hiking','trail_running'], 'blue', 'Intermediate', 3,
  9660, 762, 762, 2530, 1768,
  'out_and_back', ARRAY['dirt','rock','scramble'],
  ST_SetSRID(ST_MakePoint(-111.7600, 40.7070), 4326)::geography,
  'Salt Lake City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.5, 1234, 0, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Donut Falls', 'donut-falls',
  'A popular family hike to a unique waterfall that pours through a hole in the rock, creating a donut shape. Easy trail through Big Cottonwood Canyon with a short scramble to the falls.',
  ARRAY['hiking'], 'green', 'Beginner', 1,
  5630, 152, 152, 2440, 2290,
  'out_and_back', ARRAY['dirt','rock'],
  ST_SetSRID(ST_MakePoint(-111.6440, 40.6300), 4326)::geography,
  'Salt Lake City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.3, 2345, 0, ARRAY['summer','fall'], 'community', true
),
(
  'Living Room Trail', 'living-room-trail',
  'A popular University of Utah hike to a collection of rock furniture arranged on a hillside with views of the Salt Lake Valley and the Capitol building. Short and sweet with a creative destination.',
  ARRAY['hiking','trail_running'], 'green', 'Beginner', 1,
  3220, 183, 183, 1615, 1432,
  'out_and_back', ARRAY['dirt','rock'],
  ST_SetSRID(ST_MakePoint(-111.8300, 40.7660), 4326)::geography,
  'Salt Lake City', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.2, 1890, 0, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== ADDITIONAL BEND TRAILS =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Funner Trail', 'funner-trail',
  'True to its name, Funner is one of the most enjoyable flow trails in the Bend network. Smooth berms, small rollers, and consistent gradient through pine forest. A must-ride for anyone who likes flow.',
  ARRAY['mtb'], 'blue', 'Intermediate', 2,
  4830, 91, 152, 1350, 1280,
  'point_to_point', ARRAY['singletrack','pumice','dirt'],
  ST_SetSRID(ST_MakePoint(-121.3560, 44.0300), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Deschutes National Forest Trail Park Pass' LIMIT 1),
  4.5, 567, 9800, ARRAY['spring','summer','fall'], 'community', true
),
(
  'Flagline Trail', 'flagline-trail',
  'A longer ride in the southern part of Bend''s trail system. Flagline traverses through mixed forest with more elevation change than the Phil''s area trails. Good for riders seeking a longer, more varied ride.',
  ARRAY['mtb','trail_running'], 'blue', 'Intermediate', 3,
  12870, 305, 305, 1430, 1280,
  'loop', ARRAY['singletrack','pumice','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-121.3700, 44.0200), 4326)::geography,
  'Bend', 'Oregon', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Deschutes National Forest Trail Park Pass' LIMIT 1),
  4.4, 432, 6700, ARRAY['summer','fall'], 'community', true
);

-- ===== ADDITIONAL SEDONA TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Soldier Pass Trail', 'soldier-pass-trail',
  'A varied hike passing through a red rock canyon to a natural sinkhole called the Devil''s Kitchen, and onward to the Seven Sacred Pools and a natural arch. One of Sedona''s most feature-packed trails.',
  ARRAY['hiking'], 'blue', 'Intermediate', 2,
  6440, 152, 152, 1372, 1280,
  'out_and_back', ARRAY['dirt','rock','sandstone'],
  ST_SetSRID(ST_MakePoint(-111.7750, 34.8700), 4326)::geography,
  'Sedona', 'Arizona', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', true,
  (SELECT id FROM permits WHERE name = 'Red Rock Pass (Coconino NF)' LIMIT 1),
  4.5, 1890, 0, ARRAY['fall','winter','spring'], 'community', true
);

-- ===== ADDITIONAL LAKE TAHOE TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Rubicon Trail (Hiking)', 'rubicon-trail-hiking',
  'A scenic lakeside trail connecting D.L. Bliss and Emerald Bay State Parks. The trail hugs the shoreline with views of the crystal-clear water and passes several secluded beaches perfect for swimming.',
  ARRAY['hiking','trail_running'], 'blue', 'Intermediate', 2,
  8000, 183, 183, 1950, 1897,
  'point_to_point', ARRAY['dirt','granite','rock'],
  ST_SetSRID(ST_MakePoint(-120.0990, 38.9610), 4326)::geography,
  'South Lake Tahoe', 'California', 'United States', 'US',
  'open', NOW() - INTERVAL '3 days', false,
  4.6, 2100, 0, ARRAY['summer','fall'], 'community', true
);

-- ===== ADDITIONAL WHISTLER TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Joffre Lakes Trail', 'joffre-lakes-trail',
  'A popular hike near Whistler to three stunning turquoise glacial lakes fed by the Matier Glacier. The trail climbs through old-growth forest past waterfalls to increasingly dramatic alpine scenery.',
  ARRAY['hiking'], 'blue', 'Intermediate', 2,
  9660, 370, 370, 1570, 1200,
  'out_and_back', ARRAY['dirt','rock','boardwalk'],
  ST_SetSRID(ST_MakePoint(-122.4910, 50.3530), 4326)::geography,
  'Pemberton', 'British Columbia', 'Canada', 'CA',
  'open', NOW() - INTERVAL '2 days', false,
  4.8, 3456, 0, ARRAY['summer','fall'], 'community', true
);

-- ===== ADDITIONAL FINALE LIGURE TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Sentiero del Pellegrino', 'sentiero-del-pellegrino',
  'A scenic coastal trail connecting Finale Ligure to the ancient pilgrimage church above Varigotti. Stunning views of the Ligurian Sea from exposed cliff sections. Can be ridden or hiked.',
  ARRAY['hiking','mtb'], 'blue', 'Intermediate', 2,
  7240, 305, 305, 320, 15,
  'out_and_back', ARRAY['dirt','rock','coastal'],
  ST_SetSRID(ST_MakePoint(8.3700, 44.1600), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '1 day', false,
  4.4, 345, 2100, ARRAY['spring','fall','winter'], 'community', true
),
(
  'Sentiero delle Tagliate', 'sentiero-delle-tagliate',
  'An ancient trail cut through the cliffs above Finalpia with dramatic rock-carved passages and Mediterranean sea views. Combines history and natural beauty in a short but unforgettable hike.',
  ARRAY['hiking'], 'green', 'Beginner', 1,
  3220, 91, 91, 120, 15,
  'loop', ARRAY['rock','coastal','carved stone'],
  ST_SetSRID(ST_MakePoint(8.3550, 44.1620), 4326)::geography,
  'Finale Ligure', 'Liguria', 'Italy', 'IT',
  'open', NOW() - INTERVAL '2 days', false,
  4.5, 567, 0, ARRAY['spring','fall','winter'], 'community', true
);

-- ===== ADDITIONAL OGDEN TRAILS =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Bonneville Shoreline Trail - Ogden Section', 'bst-ogden-section',
  'The Ogden section of the Bonneville Shoreline Trail traverses the foothills above the city with views of the Great Salt Lake and Antelope Island. Smooth, rolling singletrack ideal for trail running and MTB.',
  ARRAY['mtb','trail_running','hiking'], 'green', 'Beginner', 2,
  16100, 244, 244, 1585, 1402,
  'point_to_point', ARRAY['singletrack','dirt','gravel'],
  ST_SetSRID(ST_MakePoint(-111.8500, 41.2300), 4326)::geography,
  'Ogden', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.3, 456, 5600, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== ADDITIONAL BRYCE TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Rim Trail (Bryce Canyon)', 'bryce-rim-trail',
  'A gentle trail along the edge of the Bryce amphitheater connecting 13 viewpoints over 11 miles. Paved in sections and mostly flat. The easiest way to experience Bryce''s iconic hoodoo panoramas.',
  ARRAY['hiking','trail_running'], 'green', 'Beginner', 1,
  17700, 152, 152, 2750, 2620,
  'point_to_point', ARRAY['paved','dirt','gravel'],
  ST_SetSRID(ST_MakePoint(-112.1680, 37.6350), 4326)::geography,
  'Bryce Canyon', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Bryce Canyon National Park Entrance' LIMIT 1),
  4.4, 3456, 0, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== ADDITIONAL ST. GEORGE TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Zen Trail', 'zen-trail',
  'A purpose-built flow trail near St. George with smooth berms, tabletops, and progressive features. Great for intermediate riders looking to build jump and cornering skills in a forgiving environment.',
  ARRAY['mtb'], 'blue', 'Intermediate', 2,
  6440, 122, 183, 975, 853,
  'point_to_point', ARRAY['singletrack','dirt','machine-built'],
  ST_SetSRID(ST_MakePoint(-113.6200, 37.0800), 4326)::geography,
  'St. George', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.4, 456, 7800, ARRAY['fall','winter','spring'], 'community', true
);

-- ===== ADDITIONAL ZION TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, permit_id, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Pa''rus Trail', 'parus-trail-zion',
  'A paved, wheelchair-accessible trail along the Virgin River at the bottom of Zion Canyon. Flat and easy with views of the Watchman, the Towers of the Virgin, and the Sentinel. Open to bikes.',
  ARRAY['hiking','trail_running'], 'green', 'Beginner', 1,
  5630, 15, 15, 1189, 1170,
  'out_and_back', ARRAY['paved'],
  ST_SetSRID(ST_MakePoint(-112.9860, 37.2020), 4326)::geography,
  'Springdale', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', true,
  (SELECT id FROM permits WHERE name = 'Zion National Park Entrance' LIMIT 1),
  4.2, 1890, 0, ARRAY['spring','fall','winter'], 'community', true
);

-- ===== ADDITIONAL MOAB TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Sovereign Trail', 'sovereign-trail',
  'A fast, flowing singletrack loop in the Sovereign area east of Moab. Smooth hardpack with gentle rollers and wide-open views of the La Sal Mountains. Great for intermediate riders seeking mileage.',
  ARRAY['mtb','trail_running'], 'blue', 'Intermediate', 2,
  16100, 213, 213, 1524, 1402,
  'loop', ARRAY['singletrack','hardpack','dirt'],
  ST_SetSRID(ST_MakePoint(-109.4800, 38.6100), 4326)::geography,
  'Moab', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.4, 345, 5600, ARRAY['spring','fall','winter'], 'community', true
);

-- ===== ADDITIONAL LAKE TAHOE TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Emigrant Trail to Stampede Reservoir', 'emigrant-trail-stampede',
  'A rolling cross-country ride north of Truckee through pine forest and open meadows to Stampede Reservoir. Great views of the Sierra Crest and moderate technical challenge.',
  ARRAY['mtb','hiking'], 'blue', 'Intermediate', 2,
  19310, 305, 305, 2070, 1828,
  'out_and_back', ARRAY['singletrack','dirt','rock'],
  ST_SetSRID(ST_MakePoint(-120.1100, 39.3800), 4326)::geography,
  'Truckee', 'California', 'United States', 'US',
  'open', NOW() - INTERVAL '2 days', false,
  4.3, 234, 3400, ARRAY['summer','fall'], 'community', true
);

-- ===== ADDITIONAL OGDEN TRAIL =====

INSERT INTO trails (name, slug, description, activity_types, difficulty, difficulty_label, technical_rating, distance_meters, elevation_gain_meters, elevation_loss_meters, max_elevation_meters, min_elevation_meters, trail_type, surface_type, start_point, city, state_province, country, country_code, current_condition, condition_updated_at, requires_permit, rating, review_count, ride_count, best_seasons, source, is_active)
VALUES
(
  'Indian Trail', 'indian-trail-ogden',
  'A historic trail descending through Ogden Canyon with views of the canyon walls and Pineview Reservoir. Connects to the North Ogden Divide for longer outings. Well-maintained and popular with trail runners.',
  ARRAY['hiking','trail_running'], 'blue', 'Intermediate', 2,
  6440, 305, 305, 1828, 1524,
  'out_and_back', ARRAY['dirt','rock'],
  ST_SetSRID(ST_MakePoint(-111.8100, 41.2700), 4326)::geography,
  'Ogden', 'Utah', 'United States', 'US',
  'open', NOW() - INTERVAL '1 day', false,
  4.4, 567, 0, ARRAY['spring','summer','fall'], 'community', true
);

-- ===== ADDITIONAL BUSINESSES =====

-- Additional Moab businesses
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Canyon Voyages Adventure Co.', 'canyon-voyages-adventure-co',
  'Full-service outfitter running rafting, kayaking, and combination 4x4/river trips. Multi-day expeditions through Cataract Canyon and calm-water floats for families.',
  'outfitter', ARRAY['rafting','kayaking','4x4','multi-day trips'], ARRAY['kayaking','whitewater','camping'],
  '211 N Main St', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.5497, 38.5752), 4326)::geography,
  '+1 435-259-6007', 'info@canyonvoyages.com', 'https://canyonvoyages.com',
  '{"monday":"7:00 AM - 8:00 PM","tuesday":"7:00 AM - 8:00 PM","wednesday":"7:00 AM - 8:00 PM","thursday":"7:00 AM - 8:00 PM","friday":"7:00 AM - 8:00 PM","saturday":"6:00 AM - 9:00 PM","sunday":"6:00 AM - 9:00 PM"}'::jsonb,
  4.8, 291, false, NULL, NULL,
  'Book a Cataract Canyon trip and get a free dry bag', NOW() + INTERVAL '14 days',
  true, ARRAY['rafting','Cataract Canyon','multi-day','family rafting'], 'seeder', true
),
(
  'Red Rock Bakery & Cafe', 'red-rock-bakery-cafe',
  'Early-morning fuel stop for riders, hikers, and climbers. Scratch-made pastries, massive breakfast burritos, and espresso. Outdoor patio with a trail conditions chalkboard updated daily.',
  'cafe', ARRAY['bakery','coffee','breakfast'], ARRAY['hiking','mtb','climbing','trail_running'],
  '74 S Main St', 'Moab', 'Utah', 'United States', 'US', '84532',
  ST_SetSRID(ST_MakePoint(-109.5500, 38.5718), 4326)::geography,
  '+1 435-259-3941', 'eat@redrockbakery.com', 'https://redrockbakery.com',
  '{"monday":"6:00 AM - 3:00 PM","tuesday":"6:00 AM - 3:00 PM","wednesday":"6:00 AM - 3:00 PM","thursday":"6:00 AM - 3:00 PM","friday":"6:00 AM - 3:00 PM","saturday":"6:00 AM - 4:00 PM","sunday":"7:00 AM - 2:00 PM"}'::jsonb,
  4.6, 178, false, NULL, NULL, NULL, NULL,
  true, ARRAY['breakfast','coffee','pastries','bike rack','trail conditions'], 'seeder', true
);

-- Additional Bend businesses
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Bend Brewing Company', 'bend-brewing-company',
  'Local brewery with an outdoor patio overlooking Mirror Pond. Popular post-ride gathering spot with hearty pub fare and award-winning craft beers. Bike racks out front.',
  'cafe', ARRAY['brewery','restaurant'], ARRAY['mtb','hiking','trail_running','kayaking'],
  '1019 NW Brooks St', 'Bend', 'Oregon', 'United States', 'US', '97703',
  ST_SetSRID(ST_MakePoint(-121.3165, 44.0590), 4326)::geography,
  '+1 541-383-1599', 'info@bendbrewingco.com', 'https://bendbrewingco.com',
  '{"monday":"11:00 AM - 9:00 PM","tuesday":"11:00 AM - 9:00 PM","wednesday":"11:00 AM - 9:00 PM","thursday":"11:00 AM - 9:00 PM","friday":"11:00 AM - 10:00 PM","saturday":"11:00 AM - 10:00 PM","sunday":"11:00 AM - 8:00 PM"}'::jsonb,
  4.5, 534, false, NULL, NULL, NULL, NULL,
  true, ARRAY['brewery','post-ride','patio','pub fare'], 'seeder', true
),
(
  'Tumalo Creek Kayak & Canoe', 'tumalo-creek-kayak-canoe',
  'Kayak, canoe, and SUP rentals on the Deschutes River. Guided tours of the Cascade Lakes and river instruction for all levels. Free shuttle to put-in points.',
  'gear_rental', ARRAY['kayak rental','SUP rental','guided tours'], ARRAY['kayaking','standup_paddle'],
  '805 SW Industrial Way', 'Bend', 'Oregon', 'United States', 'US', '97702',
  ST_SetSRID(ST_MakePoint(-121.3190, 44.0450), 4326)::geography,
  '+1 541-317-9407', 'paddle@tumalocreek.com', 'https://tumalocreek.com',
  '{"monday":"9:00 AM - 6:00 PM","tuesday":"9:00 AM - 6:00 PM","wednesday":"9:00 AM - 6:00 PM","thursday":"9:00 AM - 6:00 PM","friday":"9:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"8:00 AM - 6:00 PM"}'::jsonb,
  4.7, 189, false, NULL, NULL,
  '15% off sunset paddle tours', NOW() + INTERVAL '30 days',
  true, ARRAY['kayak','SUP','Deschutes River','guided paddle','family-friendly'], 'seeder', true
);

-- Additional Sedona businesses
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Red Rock Western Jeep Tours', 'red-rock-western-jeep-tours',
  'Guided off-road Jeep tours through Sedona''s most scenic backcountry routes. Sunset tours, vortex tours, and custom adventures.',
  'guide_service', ARRAY['jeep tours','sunset tours'], ARRAY['hiking'],
  '270 N Hwy 89A', 'Sedona', 'Arizona', 'United States', 'US', '86336',
  ST_SetSRID(ST_MakePoint(-111.7610, 34.8710), 4326)::geography,
  '+1 928-282-6826', 'tours@redrockjeep.com', 'https://redrockjeep.com',
  '{"monday":"7:00 AM - 8:00 PM","tuesday":"7:00 AM - 8:00 PM","wednesday":"7:00 AM - 8:00 PM","thursday":"7:00 AM - 8:00 PM","friday":"7:00 AM - 8:00 PM","saturday":"6:00 AM - 9:00 PM","sunday":"6:00 AM - 9:00 PM"}'::jsonb,
  4.7, 890, true, 'standard', NOW() + INTERVAL '90 days',
  '$20 off any sunset tour', NOW() + INTERVAL '30 days',
  true, ARRAY['jeep tours','sunset','vortex','backcountry'], 'seeder', true
),
(
  'Sedona Trail House', 'sedona-trail-house',
  'Cozy cafe right by the trailheads with locally roasted coffee, trail mix, and hearty sandwiches. The covered patio is the perfect spot to decompress after a ride or hike.',
  'cafe', ARRAY['cafe','coffee','light meals'], ARRAY['mtb','hiking','trail_running'],
  '371 Forest Rd', 'Sedona', 'Arizona', 'United States', 'US', '86336',
  ST_SetSRID(ST_MakePoint(-111.7680, 34.8650), 4326)::geography,
  '+1 928-282-0450', 'hello@sedonatrailhouse.com', 'https://sedonatrailhouse.com',
  '{"monday":"6:00 AM - 3:00 PM","tuesday":"6:00 AM - 3:00 PM","wednesday":"6:00 AM - 3:00 PM","thursday":"6:00 AM - 3:00 PM","friday":"6:00 AM - 3:00 PM","saturday":"6:00 AM - 4:00 PM","sunday":"7:00 AM - 2:00 PM"}'::jsonb,
  4.6, 234, false, NULL, NULL, NULL, NULL,
  true, ARRAY['coffee','trail snacks','maps','trailhead'], 'seeder', true
),
(
  'Sedona Adventure Center', 'sedona-adventure-center',
  'One-stop shop for outdoor gear rental. Bikes, hiking poles, camping gear, GPS units, and bear spray. Helpful staff will customize a gear package for your itinerary.',
  'gear_rental', ARRAY['camping gear','bike rental','hiking gear'], ARRAY['hiking','mtb','camping'],
  '2081 W Hwy 89A', 'Sedona', 'Arizona', 'United States', 'US', '86336',
  ST_SetSRID(ST_MakePoint(-111.7900, 34.8750), 4326)::geography,
  '+1 928-282-5500', 'rent@sedonaadventure.com', 'https://sedonaadventure.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.4, 145, false, NULL, NULL,
  'Free water bottle with gear package rental', NOW() + INTERVAL '30 days',
  true, ARRAY['gear rental','bikes','camping','hiking gear'], 'seeder', true
);

-- Additional Lake Tahoe businesses
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Tahoe Sports Hub', 'tahoe-sports-hub',
  'Truckee''s local gear shop with ski and bike rentals, tune-ups, and a great selection of outdoor apparel.',
  'outfitter', ARRAY['rental','retail','tune-ups'], ARRAY['mtb','skiing','snowboarding','hiking'],
  '10095 West River St', 'Truckee', 'California', 'United States', 'US', '96161',
  ST_SetSRID(ST_MakePoint(-120.1835, 39.3260), 4326)::geography,
  '+1 530-582-4510', 'info@tahoesportshub.com', 'https://tahoesportshub.com',
  '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 7:00 PM","saturday":"8:00 AM - 7:00 PM","sunday":"9:00 AM - 5:00 PM"}'::jsonb,
  4.5, 267, false, NULL, NULL, NULL, NULL,
  true, ARRAY['ski rentals','bike rentals','outdoor gear','Truckee'], 'seeder', true
),
(
  'Donner Lake Kitchen', 'donner-lake-kitchen',
  'A cozy morning cafe near Donner Pass popular with skiers, hikers, and cyclists. Hearty breakfasts, fresh-baked goods, and locally roasted coffee.',
  'cafe', ARRAY['breakfast','bakery','coffee'], ARRAY['hiking','skiing','mtb','trail_running'],
  '12830 Donner Pass Rd', 'Truckee', 'California', 'United States', 'US', '96161',
  ST_SetSRID(ST_MakePoint(-120.2340, 39.3320), 4326)::geography,
  '+1 530-587-3342', 'info@donnerlakekitchen.com', 'https://donnerlakekitchen.com',
  '{"monday":"6:00 AM - 3:00 PM","tuesday":"6:00 AM - 3:00 PM","wednesday":"6:00 AM - 3:00 PM","thursday":"6:00 AM - 3:00 PM","friday":"6:00 AM - 3:00 PM","saturday":"6:00 AM - 4:00 PM","sunday":"7:00 AM - 2:00 PM"}'::jsonb,
  4.6, 189, false, NULL, NULL, NULL, NULL,
  true, ARRAY['breakfast','bakery','coffee','skiers','hikers'], 'seeder', true
);

-- Additional Whistler businesses
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, currency, source, is_active)
VALUES
(
  'Whistler Alpine Guides', 'whistler-alpine-guides',
  'Year-round guiding in the Coast Mountains. Summer alpine hiking, scrambling, and glacier travel. Winter backcountry ski touring and avalanche courses. ACMG-certified guides.',
  'guide_service', ARRAY['alpine','glacier','backcountry ski'], ARRAY['hiking','skiing','climbing'],
  '4293 Mountain Square', 'Whistler', 'British Columbia', 'Canada', 'CA', 'V8E 1B8',
  ST_SetSRID(ST_MakePoint(-122.9555, 50.1148), 4326)::geography,
  '+1 604-938-9242', 'book@whistlerguides.com', 'https://whistlerguides.com',
  '{"monday":"7:00 AM - 8:00 PM","tuesday":"7:00 AM - 8:00 PM","wednesday":"7:00 AM - 8:00 PM","thursday":"7:00 AM - 8:00 PM","friday":"7:00 AM - 8:00 PM","saturday":"6:00 AM - 9:00 PM","sunday":"6:00 AM - 9:00 PM"}'::jsonb,
  4.9, 312, true, 'premium', NOW() + INTERVAL '90 days', NULL, NULL,
  true, ARRAY['alpine guides','ACMG certified','glacier travel','backcountry skiing'], 'CAD', 'seeder', true
),
(
  'Handlebar Cafe', 'handlebar-cafe',
  'A beloved Whistler institution where mountain bikers refuel after a day in the bike park. Huge portions, cold drinks, and walls covered in bike memorabilia.',
  'cafe', ARRAY['restaurant','bar'], ARRAY['mtb','hiking','skiing'],
  '4314 Main St', 'Whistler', 'British Columbia', 'Canada', 'CA', 'V8E 1B1',
  ST_SetSRID(ST_MakePoint(-122.9550, 50.1160), 4326)::geography,
  '+1 604-932-4540', 'info@handlebar.ca', 'https://handlebar.ca',
  '{"monday":"11:00 AM - 11:00 PM","tuesday":"11:00 AM - 11:00 PM","wednesday":"11:00 AM - 11:00 PM","thursday":"11:00 AM - 11:00 PM","friday":"11:00 AM - 12:00 AM","saturday":"11:00 AM - 12:00 AM","sunday":"11:00 AM - 10:00 PM"}'::jsonb,
  4.5, 890, false, NULL, NULL, NULL, NULL,
  true, ARRAY['post-ride','burgers','patio','bike park'], 'CAD', 'seeder', true
),
(
  'Whistler Hostel', 'whistler-hostel',
  'Budget-friendly base camp steps from the Village gondola. Dorm beds, private rooms, and a communal kitchen full of stoke. Gear storage, bike wash, and a hot tub.',
  'lodge', ARRAY['dorms','private rooms'], ARRAY['mtb','skiing','hiking','snowboarding'],
  '1035 Legacy Way', 'Whistler', 'British Columbia', 'Canada', 'CA', 'V8E 0M3',
  ST_SetSRID(ST_MakePoint(-122.9590, 50.1130), 4326)::geography,
  '+1 604-962-0025', 'stay@whistlerhostel.com', 'https://whistlerhostel.com',
  '{"monday":"7:00 AM - 10:00 PM","tuesday":"7:00 AM - 10:00 PM","wednesday":"7:00 AM - 10:00 PM","thursday":"7:00 AM - 10:00 PM","friday":"7:00 AM - 11:00 PM","saturday":"7:00 AM - 11:00 PM","sunday":"7:00 AM - 10:00 PM"}'::jsonb,
  4.3, 678, false, NULL, NULL, NULL, NULL,
  true, ARRAY['hostel','budget','hot tub','bike wash','village gondola'], 'CAD', 'seeder', true
);

-- Additional Park City businesses
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Silver Star Cafe', 'silver-star-cafe',
  'A cozy brunch spot on Park City''s Main Street popular with skiers and mountain bikers. Locally sourced ingredients, creative egg dishes, and strong coffee. Outdoor patio with views of the ski jumps.',
  'cafe', ARRAY['breakfast','brunch','coffee'], ARRAY['hiking','skiing','mtb'],
  '1825 Three Kings Dr', 'Park City', 'Utah', 'United States', 'US', '84060',
  ST_SetSRID(ST_MakePoint(-111.5010, 40.6490), 4326)::geography,
  '+1 435-655-3456', 'info@thesilverstarcafe.com', 'https://thesilverstarcafe.com',
  '{"monday":"8:00 AM - 2:00 PM","tuesday":"8:00 AM - 2:00 PM","wednesday":"8:00 AM - 2:00 PM","thursday":"8:00 AM - 2:00 PM","friday":"8:00 AM - 2:00 PM","saturday":"7:00 AM - 3:00 PM","sunday":"7:00 AM - 3:00 PM"}'::jsonb,
  4.6, 345, false, NULL, NULL, NULL, NULL,
  true, ARRAY['brunch','coffee','post-ride','locally sourced'], 'seeder', true
);

-- Additional SLC business
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Wasatch Touring', 'wasatch-touring',
  'Salt Lake City''s backcountry ski and mountain bike specialist. Expert staff, high-end gear, and regular clinics on avalanche safety and bike maintenance.',
  'bike_shop', ARRAY['retail','repair','backcountry ski'], ARRAY['mtb','skiing'],
  '702 E 100 S', 'Salt Lake City', 'Utah', 'United States', 'US', '84102',
  ST_SetSRID(ST_MakePoint(-111.8750, 40.7620), 4326)::geography,
  '+1 801-359-9361', 'info@wasatchtouring.com', 'https://wasatchtouring.com',
  '{"monday":"10:00 AM - 7:00 PM","tuesday":"10:00 AM - 7:00 PM","wednesday":"10:00 AM - 7:00 PM","thursday":"10:00 AM - 7:00 PM","friday":"10:00 AM - 7:00 PM","saturday":"9:00 AM - 6:00 PM","sunday":"11:00 AM - 5:00 PM"}'::jsonb,
  4.7, 234, false, NULL, NULL, NULL, NULL,
  true, ARRAY['backcountry ski','MTB','expert staff','clinics'], 'seeder', true
);

-- Additional Ogden business
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Bingham Cyclery Ogden', 'bingham-cyclery-ogden',
  'A well-stocked bike shop in Ogden with road, mountain, and e-bike sales and rentals. Expert mechanics and a helpful staff who know the local Wasatch trails.',
  'bike_shop', ARRAY['rental','repair','retail'], ARRAY['mtb','road_cycling'],
  '1370 Washington Blvd', 'Ogden', 'Utah', 'United States', 'US', '84404',
  ST_SetSRID(ST_MakePoint(-111.9710, 41.2280), 4326)::geography,
  '+1 801-399-4981', 'ogden@bfrb.com', 'https://bfrb.com',
  '{"monday":"10:00 AM - 6:00 PM","tuesday":"10:00 AM - 6:00 PM","wednesday":"10:00 AM - 6:00 PM","thursday":"10:00 AM - 6:00 PM","friday":"10:00 AM - 7:00 PM","saturday":"9:00 AM - 6:00 PM","sunday":"Closed"}'::jsonb,
  4.5, 178, false, NULL, NULL, NULL, NULL,
  true, ARRAY['bike shop','rentals','Ogden','Wasatch trails'], 'seeder', true
);

-- Additional Hurricane business
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Hurricane Cliffs Campground', 'hurricane-cliffs-campground',
  'A small, rider-friendly campground at the base of the Hurricane Cliffs trail system. Tent and RV sites with a bike wash, repair station, and fire pits. Wake up and ride from your campsite.',
  'campground', ARRAY['tent sites','RV sites','bike wash'], ARRAY['mtb','hiking','camping'],
  '600 S Old Hwy 91', 'Hurricane', 'Utah', 'United States', 'US', '84737',
  ST_SetSRID(ST_MakePoint(-113.2800, 37.1350), 4326)::geography,
  '+1 435-635-2000', 'camp@hurricanecliffs.com', 'https://hurricanecliffscampground.com',
  '{"monday":"24 hours","tuesday":"24 hours","wednesday":"24 hours","thursday":"24 hours","friday":"24 hours","saturday":"24 hours","sunday":"24 hours"}'::jsonb,
  4.4, 123, false, NULL, NULL, NULL, NULL,
  true, ARRAY['campground','ride from camp','bike wash','Hurricane Cliffs'], 'seeder', true
);

-- Additional Bryce area business
INSERT INTO businesses (name, slug, description, category, subcategories, activity_types, address, city, state_province, country, country_code, postal_code, geom, phone, email, website_url, hours, rating, review_count, is_spotlight, spotlight_tier, spotlight_expires_at, special_offer, special_offer_expires_at, is_claimed, tags, source, is_active)
VALUES
(
  'Ruby''s Inn General Store', 'rubys-inn-general-store',
  'The gateway store to Bryce Canyon National Park. Camping supplies, souvenirs, groceries, and trail snacks. Located at the park entrance with shuttle service to trailheads.',
  'outfitter', ARRAY['camping supplies','groceries','souvenirs'], ARRAY['hiking','camping'],
  '26 S Main St', 'Bryce Canyon City', 'Utah', 'United States', 'US', '84764',
  ST_SetSRID(ST_MakePoint(-112.1610, 37.6630), 4326)::geography,
  '+1 435-834-5341', 'info@rubysinn.com', 'https://rubysinn.com',
  '{"monday":"7:00 AM - 10:00 PM","tuesday":"7:00 AM - 10:00 PM","wednesday":"7:00 AM - 10:00 PM","thursday":"7:00 AM - 10:00 PM","friday":"7:00 AM - 10:00 PM","saturday":"7:00 AM - 10:00 PM","sunday":"7:00 AM - 10:00 PM"}'::jsonb,
  4.2, 567, false, NULL, NULL, NULL, NULL,
  true, ARRAY['Bryce Canyon','supplies','shuttle','park entrance'], 'seeder', true
);

-- --------------------------------------------------------------------------
-- 5. Reviews
-- --------------------------------------------------------------------------

-- Trail reviews
INSERT INTO reviews (author_id, entity_type, entity_id, rating, title, body, is_verified, created_at) VALUES
-- Moab trails
('00000000-0000-0000-0000-000000000002', 'trail', (SELECT id FROM trails WHERE slug = 'slickrock-trail' LIMIT 1), 5, 'Lives up to the hype', 'There is nothing else like riding Slickrock. The petrified dunes give you traction at angles that feel impossible. We rode the practice loop first, then committed to the full 10-mile loop. Bring more water than you think.', true, NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000005', 'trail', (SELECT id FROM trails WHERE slug = 'slickrock-trail' LIMIT 1), 4, 'Incredible but exhausting', 'Did this in April with perfect weather. The trail is way more physically demanding than it looks on paper. The constant ups and downs on sandstone drain your legs fast. Absolutely stunning though.', true, NOW() - INTERVAL '14 days'),
('00000000-0000-0000-0000-000000000003', 'trail', (SELECT id FROM trails WHERE slug = 'porcupine-rim' LIMIT 1), 5, 'Incredible exposure on Porcupine', 'The Colorado River views from the rim are worth every pedal stroke. The descent is seriously gnarly though. Shuttle from Poison Spider is the way to go.', true, NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000007', 'trail', (SELECT id FROM trails WHERE slug = 'whole-enchilada' LIMIT 1), 5, 'The ultimate Moab ride', 'Five ecosystems in one ride. Started in alpine aspen forest and ended at the river. Every section has a different character. The UPS section near the bottom is incredibly technical. Shuttle is mandatory.', true, NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000001', 'trail', (SELECT id FROM trails WHERE slug = 'captain-ahab' LIMIT 1), 5, 'Sculpted sandstone playground', 'Captain Ahab is like riding through a skatepark carved by nature. The bowls, drops, and natural features reward creative line choice. Linked it with Amasa Back for a full day of amazing riding.', true, NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0000-000000000006', 'trail', (SELECT id FROM trails WHERE slug = 'corona-arch-trail' LIMIT 1), 5, 'Corona Arch is stunning', 'Short enough for a morning out, dramatic enough to feel like a real adventure. The scramble sections are fun without being scary. One of the best bang-for-your-buck hikes in the area.', true, NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0000-000000000007', 'trail', (SELECT id FROM trails WHERE slug = 'amasa-back' LIMIT 1), 5, 'Cliffhanger is wild', 'Did the full Amasa Back with the Cliffhanger option. The exposure on Cliffhanger is real deal. Not for beginners but the views are worth it if you have the skills.', true, NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000008', 'trail', (SELECT id FROM trails WHERE slug = 'gemini-bridges' LIMIT 1), 4, 'Perfect for my first Moab ride', 'Shuttled to the top and it was a great intro to desert riding. The bridges themselves are amazing to see. Trail is mostly smooth with a few rocky sections.', true, NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000011', 'trail', (SELECT id FROM trails WHERE slug = 'mag-7' LIMIT 1), 4, 'Great shuttle day', 'Seven unique trail segments from high desert to river valley. The variety keeps it interesting all day. Some sandy sections but mostly fun singletrack and doubletrack.', true, NOW() - INTERVAL '15 days'),

-- Park City trails
('00000000-0000-0000-0000-000000000003', 'trail', (SELECT id FROM trails WHERE slug = 'wasatch-crest-trail' LIMIT 1), 5, 'Best alpine ride in Utah', 'Wasatch Crest is the crown jewel of Park City riding. The ridgeline section above 10,000 feet with views into both valleys is surreal. Technical but manageable for strong intermediate riders.', true, NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0000-000000000001', 'trail', (SELECT id FROM trails WHERE slug = 'mid-mountain-trail' LIMIT 1), 5, 'Flow through aspens', 'Mid Mountain is pure singletrack heaven. 22 miles of contouring through aspen groves with wildflower meadows. The fall colors are incredible. Best intermediate trail in Utah.', true, NOW() - INTERVAL '9 days'),

-- St. George / Hurricane trails
('00000000-0000-0000-0000-000000000003', 'trail', (SELECT id FROM trails WHERE slug = 'gooseberry-mesa' LIMIT 1), 5, 'Best slickrock outside Moab', 'Gooseberry is world-class. The white line slickrock sections are addictive and the views of Zion are jaw-dropping. Rode every trail on the mesa in one long day. Already planning my return.', true, NOW() - INTERVAL '11 days'),
('00000000-0000-0000-0000-000000000005', 'trail', (SELECT id FROM trails WHERE slug = 'gooseberry-mesa' LIMIT 1), 5, 'A slickrock masterpiece', 'Gooseberry lives up to every bit of hype. The traction on the white slickrock is unreal. Camping on the mesa and riding at sunrise should be on every mountain biker''s bucket list.', true, NOW() - INTERVAL '18 days'),
('00000000-0000-0000-0000-000000000011', 'trail', (SELECT id FROM trails WHERE slug = 'jem-trail' LIMIT 1), 4, 'Smooth desert flow', 'JEM is the perfect warm-up or recovery ride near Hurricane. Smooth singletrack with gentle rollers and big views of the Virgin River valley. Good drainage after rain too.', true, NOW() - INTERVAL '13 days'),

-- Zion trails
('00000000-0000-0000-0000-000000000004', 'trail', (SELECT id FROM trails WHERE slug = 'angels-landing' LIMIT 1), 5, 'Terrifying and magnificent', 'The chain section is as exposed as advertised. My hands were shaking but I could not stop grinning. The view from the top is one of the most spectacular things I have ever seen. Get the permit early.', true, NOW() - INTERVAL '4 days'),
('00000000-0000-0000-0000-000000000006', 'trail', (SELECT id FROM trails WHERE slug = 'angels-landing' LIMIT 1), 5, 'Worth every ounce of fear', 'Did this with trembling knees and zero regrets. The permit system means fewer crowds on the chains section. Go at sunrise for the best light and fewer people.', true, NOW() - INTERVAL '16 days'),
('00000000-0000-0000-0000-000000000002', 'trail', (SELECT id FROM trails WHERE slug = 'the-narrows-bottom-up' LIMIT 1), 5, 'Nothing else like it', 'Wading through the Virgin River between thousand-foot walls is an otherworldly experience. Rent the gear in Springdale -- the neoprene socks and canyoneering shoes make all the difference.', true, NOW() - INTERVAL '9 days'),
('00000000-0000-0000-0000-000000000012', 'trail', (SELECT id FROM trails WHERE slug = 'the-narrows-bottom-up' LIMIT 1), 4, 'Magical but check water levels', 'The Narrows are unlike any hike I have done. The canyon walls tower above you and the light filtering through is magical. Check the flow rate before you go -- we turned back at Big Springs due to high water.', true, NOW() - INTERVAL '22 days'),

-- Bryce Canyon trails
('00000000-0000-0000-0000-000000000006', 'trail', (SELECT id FROM trails WHERE slug = 'navajo-loop-trail' LIMIT 1), 5, 'Hoodoo wonderland', 'Walking among the hoodoos feels like being on another planet. The Navajo Loop combined with Queens Garden is the perfect Bryce sampler. The Wall Street section with its narrow switchbacks is incredible.', true, NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000012', 'trail', (SELECT id FROM trails WHERE slug = 'fairyland-loop-trail' LIMIT 1), 5, 'Uncrowded Bryce magic', 'Fairyland Loop is the secret gem of Bryce. Fewer people than the main amphitheater trails and the formations are just as spectacular. Tower Bridge is a highlight. Go early and bring plenty of water.', true, NOW() - INTERVAL '12 days'),

-- SLC / Wasatch trails
('00000000-0000-0000-0000-000000000008', 'trail', (SELECT id FROM trails WHERE slug = 'mount-olympus' LIMIT 1), 4, 'Punishing but rewarding', 'Mount Olympus does not let up. It is steep from start to finish with a scramble near the top. But the views from the summit over the entire Salt Lake Valley are worth every drop of sweat.', true, NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000002', 'trail', (SELECT id FROM trails WHERE slug = 'lake-blanche-trail' LIMIT 1), 5, 'Stunning alpine lake', 'Lake Blanche is one of the most beautiful spots in the Wasatch. The turquoise water beneath Sundial Peak is stunning. Steep hike but the payoff is enormous. Go on a weekday to avoid crowds.', true, NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000005', 'trail', (SELECT id FROM trails WHERE slug = 'corner-canyon-trails' LIMIT 1), 5, 'Best trail system near SLC', 'Corner Canyon has something for everyone. I ride Rush and Maple Hollow weekly. The purpose-built trails drain perfectly and the variety from flow to tech is unmatched within city limits.', true, NOW() - INTERVAL '3 days'),

-- Bend trails
('00000000-0000-0000-0000-000000000001', 'trail', (SELECT id FROM trails WHERE slug = 'phils-trail-complex' LIMIT 1), 5, 'Best trail system in the PNW', 'Spent a week riding Phil''s and barely scratched the surface. The flow trails are perfectly maintained and the network lets you build any length ride. Pumice soil drains fast after rain.', true, NOW() - INTERVAL '15 days'),
('00000000-0000-0000-0000-000000000006', 'trail', (SELECT id FROM trails WHERE slug = 'south-sister-summit' LIMIT 1), 5, 'Bucket list summit', 'Started at 5am and reached the top by 10. The last 1000 feet of scree is a grind but the 360 panorama from the summit is beyond words. Could see every Cascade volcano.', true, NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000008', 'trail', (SELECT id FROM trails WHERE slug = 'tumalo-falls-trail' LIMIT 1), 4, 'Beautiful waterfall hike', 'The main falls are spectacular and the upper cascades are equally gorgeous with fewer people. Gets crowded on summer weekends so go early.', true, NOW() - INTERVAL '11 days'),

-- Whistler trails
('00000000-0000-0000-0000-000000000007', 'trail', (SELECT id FROM trails WHERE slug = 'a-line' LIMIT 1), 5, 'Every jumper''s dream', 'Finally rode A-Line and it lives up to every video I have ever watched. The jumps are perfectly shaped and predictable. Lapped it until my arms gave out.', true, NOW() - INTERVAL '25 days'),
('00000000-0000-0000-0000-000000000001', 'trail', (SELECT id FROM trails WHERE slug = 'comfortably-numb' LIMIT 1), 5, 'XC perfection', 'This trail is flow incarnate. Smooth singletrack through old-growth forest with just the right amount of challenge. The length is perfect for a half-day ride.', true, NOW() - INTERVAL '18 days'),
('00000000-0000-0000-0000-000000000003', 'trail', (SELECT id FROM trails WHERE slug = 'top-of-the-world' LIMIT 1), 5, 'Peak experience', 'The views from the top of Whistler Mountain are staggering. The trail descends through every type of terrain from alpine rock to loamy forest. A must-ride if you are in Whistler.', true, NOW() - INTERVAL '20 days'),

-- Sedona trails
('00000000-0000-0000-0000-000000000001', 'trail', (SELECT id FROM trails WHERE slug = 'hiline-trail' LIMIT 1), 5, 'Technical masterpiece', 'Hiline combines technical challenge with views that make you stop mid-pedal stroke. The slickrock sections are grippy and the exposure keeps you focused.', true, NOW() - INTERVAL '9 days'),
('00000000-0000-0000-0000-000000000004', 'trail', (SELECT id FROM trails WHERE slug = 'cathedral-rock-trail' LIMIT 1), 5, 'Worth the crowds', 'Yes it is popular for a reason. The scramble to the top is exhilarating and the views in every direction are incredible. Go at sunrise to beat the crowds and the heat.', true, NOW() - INTERVAL '13 days'),
('00000000-0000-0000-0000-000000000009', 'trail', (SELECT id FROM trails WHERE slug = 'west-fork-oak-creek' LIMIT 1), 5, 'Most beautiful canyon hike', 'Hiked this in October and the fall colors in the canyon were breathtaking. Dozens of creek crossings keep it interesting. Easy enough for all ages but still feels like an adventure.', true, NOW() - INTERVAL '16 days'),
('00000000-0000-0000-0000-000000000003', 'trail', (SELECT id FROM trails WHERE slug = 'hangover-trail' LIMIT 1), 5, 'Real exposure real rewards', 'Hangover earns its double-black rating. The ledge sections have real consequences if you lose focus. But the views from the exposed traverse are some of the best in Sedona.', true, NOW() - INTERVAL '7 days'),

-- Lake Tahoe trails
('00000000-0000-0000-0000-000000000001', 'trail', (SELECT id FROM trails WHERE slug = 'flume-trail' LIMIT 1), 5, 'Tahoe''s must-ride', 'The views of the lake from 1500 feet above are surreal. The singletrack is smooth and fast with great exposure. Shuttle to the top is worth every penny.', true, NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000007', 'trail', (SELECT id FROM trails WHERE slug = 'mr-toads-wild-ride' LIMIT 1), 4, 'Hang on tight', 'This trail earned its name. It is relentlessly rocky and steep. My hands were burning after the descent. Not pretty riding but it is an experience you will not forget.', true, NOW() - INTERVAL '19 days'),

-- Finale Ligure trails
('00000000-0000-0000-0000-000000000011', 'trail', (SELECT id FROM trails WHERE slug = 'roller-coaster-finale' LIMIT 1), 5, 'Mediterranean enduro perfection', 'Roller Coaster is everything I hoped for. Rocky, technical, and the views of the Ligurian Sea are stunning. The trail just keeps going and every section has a different character. Finale is the real deal.', true, NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0000-000000000003', 'trail', (SELECT id FROM trails WHERE slug = 'roller-coaster-finale' LIMIT 1), 5, 'Why Finale is famous', 'Now I understand the hype. Roller Coaster descends through rocky switchbacks with sea views the whole way. The grip on the limestone is surprisingly good. Brought knee pads and used them.', true, NOW() - INTERVAL '14 days'),
('00000000-0000-0000-0000-000000000007', 'trail', (SELECT id FROM trails WHERE slug = 'bric-scimarco-loop' LIMIT 1), 4, 'Full day of Finale goodness', 'The Bric Scimarco loop is a proper enduro day out. Tough climb but the ridgeline views and the descent make up for it. Pack lunch and water -- there is nothing up top.', true, NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000011', 'trail', (SELECT id FROM trails WHERE slug = 'cacciatori-finale' LIMIT 1), 4, 'Roots and rocks galore', 'Cacciatori is steep and unrelenting. The rooty sections keep you guessing and the tight switchbacks demand precision. Not a flow trail -- it is a proper natural descent.', true, NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000012', 'trail', (SELECT id FROM trails WHERE slug = 'il-boschetto-finale' LIMIT 1), 5, 'Olive grove magic', 'Il Boschetto is pure joy. Flowing singletrack through olive groves with the sea breeze in your face. Perfect warm-up trail or recovery ride. Finale has trails for every mood.', true, NOW() - INTERVAL '6 days');

-- Business reviews
INSERT INTO reviews (author_id, entity_type, entity_id, rating, title, body, is_verified, created_at) VALUES
('00000000-0000-0000-0000-000000000007', 'business', (SELECT id FROM businesses WHERE slug = 'poison-spider-bicycles' LIMIT 1), 5, 'Best bike shop in Moab, period', 'Rented a Ripmo for three days and it was dialed perfectly. Staff helped me pick lines on Porcupine Rim I never would have found on my own. Trailside repair kit included at no extra charge.', true, NOW() - INTERVAL '4 days'),
('00000000-0000-0000-0000-000000000002', 'business', (SELECT id FROM businesses WHERE slug = 'poison-spider-bicycles' LIMIT 1), 5, 'Nailed the bike fit', 'They took the time to set up the suspension for my weight and riding style. The rental felt like my own bike by the second ride. Will be back every year.', true, NOW() - INTERVAL '21 days'),
('00000000-0000-0000-0000-000000000005', 'business', (SELECT id FROM businesses WHERE slug = 'chile-pepper-bike-shop' LIMIT 1), 4, 'Solid shop good prices', 'Great value rentals and the staff is friendly and knowledgeable. Got a nice Stumpjumper for a fair price. Located right on Main Street which is convenient.', true, NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000003', 'business', (SELECT id FROM businesses WHERE slug = 'western-spirit-cycling' LIMIT 1), 5, 'Life-changing multi-day trip', 'Did the White Rim Trail 4-day trip and it exceeded every expectation. The guides are incredible, the camping setup is luxurious, and the gourmet meals in the desert are unreal.', true, NOW() - INTERVAL '9 days'),
('00000000-0000-0000-0000-000000000001', 'business', (SELECT id FROM businesses WHERE slug = 'pine-mountain-sports' LIMIT 1), 5, 'Bend locals know best', 'The staff built me a custom loop hitting all the best trails in the Phil''s network based on my skill level. Rental bike was in perfect condition. Great shop.', true, NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000008', 'business', (SELECT id FROM businesses WHERE slug = 'cog-wild-mountain-bike-tours' LIMIT 1), 5, 'Best guided MTB experience', 'The guide knew every connector and showed us trails we never would have found. Small group and personalized pace made it feel like riding with a knowledgeable friend.', true, NOW() - INTERVAL '16 days'),
('00000000-0000-0000-0000-000000000001', 'business', (SELECT id FROM businesses WHERE slug = 'thunder-mountain-bikes' LIMIT 1), 5, 'Perfect rental experience', 'Rented a Yeti SB130 and it was perfect for Sedona terrain. Staff recommended a route combining Hiline and Broken Arrow that was the highlight of my trip.', true, NOW() - INTERVAL '7 days'),
('00000000-0000-0000-0000-000000000003', 'business', (SELECT id FROM businesses WHERE slug = 'flume-trail-bikes' LIMIT 1), 5, 'Shuttle + rental combo is the way', 'Got the shuttle and rental package and it made the Flume Trail experience seamless. Bike was great, shuttle was on time, and the staff gave us tips on the best viewpoints.', true, NOW() - INTERVAL '14 days'),
('00000000-0000-0000-0000-000000000009', 'business', (SELECT id FROM businesses WHERE slug = 'tahoe-adventure-company' LIMIT 1), 5, 'Incredible kayak tour', 'Did the Emerald Bay kayak tour and the guide was fantastic. Paddled right up to Fannette Island and learned about the history of the area. All gear included and top quality.', true, NOW() - INTERVAL '11 days'),
('00000000-0000-0000-0000-000000000007', 'business', (SELECT id FROM businesses WHERE slug = 'fanatyk-co-ski-cycle' LIMIT 1), 5, 'Dialed bike park setup', 'Had my bike tuned specifically for the Whistler Bike Park and they nailed it. Brake bleed, suspension setup, tire pressure recommendations for every trail type.', true, NOW() - INTERVAL '28 days'),
('00000000-0000-0000-0000-000000000001', 'business', (SELECT id FROM businesses WHERE slug = 'white-pine-touring' LIMIT 1), 5, 'Park City trail experts', 'White Pine set me up with the perfect bike and a custom route for a full day on Mid Mountain and Wasatch Crest. The staff rides these trails every day and it shows.', true, NOW() - INTERVAL '6 days'),
('00000000-0000-0000-0000-000000000003', 'business', (SELECT id FROM businesses WHERE slug = 'red-rock-bicycle-co' LIMIT 1), 5, 'Gooseberry shuttle is key', 'Got the rental and Gooseberry shuttle combo from Red Rock Bicycle. Saved us a long, rough drive in our rental car. The bikes were dialed and the shuttle driver gave us great beta.', true, NOW() - INTERVAL '15 days'),
('00000000-0000-0000-0000-000000000004', 'business', (SELECT id FROM businesses WHERE slug = 'zion-adventure-company' LIMIT 1), 5, 'Narrows gear rental was perfect', 'Rented the full Narrows package -- dry suit, boots, and poles. Made the river hike so much more comfortable. Staff gave great advice on water levels and how far to go.', true, NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000011', 'business', (SELECT id FROM businesses WHERE slug = 'finale-freeride' LIMIT 1), 5, 'The OG Finale shop', 'Finale Freeride set me up with an incredible enduro bike and a shuttle to the top of Roller Coaster. The guides know every hidden trail in the region. Essential stop in Finale.', true, NOW() - INTERVAL '5 days'),
('00000000-0000-0000-0000-000000000007', 'business', (SELECT id FROM businesses WHERE slug = 'finale-freeride' LIMIT 1), 5, 'Cannot visit Finale without them', 'Rented for a week and the bike was in perfect condition every day. They recommended trails based on our skill level and the conditions. Shuttle service is reliable and affordable.', true, NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000003', 'business', (SELECT id FROM businesses WHERE slug = 'whistler-mountain-bike-park' LIMIT 1), 5, 'Best bike park on Earth', 'Over 80 trails from mellow flow to insane downhill. A-Line alone is worth the trip. The lift system is efficient and the trail maintenance is impeccable. Every mountain biker needs to visit at least once.', true, NOW() - INTERVAL '22 days');

-- --------------------------------------------------------------------------
-- 6. Activity Posts
-- --------------------------------------------------------------------------

INSERT INTO activity_posts (user_id, post_type, activity_type, title, description, location_name, location_point, trail_id, activity_date, skill_level, max_participants, current_participants, permit_required, permit_type, gear_required, contact_method, is_public, status, view_count)
VALUES
-- Moab
('00000000-0000-0000-0000-000000000001', 'im_going', 'mtb', 'Sunrise Slickrock session', 'Hitting Slickrock at first light before the heat kicks in. Planning to ride the full loop. Happy to have company if you can keep a moderate pace.', 'Slickrock Trail, Sand Flats', ST_SetSRID(ST_MakePoint(-109.5128, 38.5912), 4326)::geography, (SELECT id FROM trails WHERE slug = 'slickrock-trail' LIMIT 1), NOW() + INTERVAL '3 days', 'intermediate', 4, 1, false, NULL, ARRAY['full-suspension bike','helmet','3L water minimum'], 'in_app', true, 'active', 42),
('00000000-0000-0000-0000-000000000005', 'lfg', 'mtb', 'Porcupine Rim shuttle crew needed', 'Need 2-3 more riders to split a Coyote Shuttle for Porcupine Rim. Meeting at Poison Spider at 8am. Strong intermediate to advanced riders preferred.', 'Porcupine Rim Trailhead', ST_SetSRID(ST_MakePoint(-109.4432, 38.5955), 4326)::geography, (SELECT id FROM trails WHERE slug = 'porcupine-rim' LIMIT 1), NOW() + INTERVAL '5 days', 'advanced', 6, 1, false, NULL, ARRAY['full-suspension bike','helmet','knee pads'], 'in_app', true, 'active', 67),
('00000000-0000-0000-0000-000000000007', 'im_going', 'mtb', 'Whole Enchilada day', 'Sending the Whole Enchilada top to bottom. Shuttle booked for 7am departure. Looking for experienced riders who want to session the gnarly sections. Full day commitment.', 'Geyser Pass Road', ST_SetSRID(ST_MakePoint(-109.2700, 38.5100), 4326)::geography, (SELECT id FROM trails WHERE slug = 'whole-enchilada' LIMIT 1), NOW() + INTERVAL '4 days', 'expert', 4, 1, false, NULL, ARRAY['full-suspension bike','full-face helmet','body armor','3L water'], 'in_app', true, 'active', 95),

-- Park City
('00000000-0000-0000-0000-000000000003', 'im_going', 'mtb', 'Wasatch Crest sunset ride', 'Planning to shuttle to the Crest for a sunset ride along the ridgeline. The light on the Wasatch peaks at golden hour is unreal. Strong intermediate riders welcome.', 'Wasatch Crest Trailhead', ST_SetSRID(ST_MakePoint(-111.5860, 40.6350), 4326)::geography, (SELECT id FROM trails WHERE slug = 'wasatch-crest-trail' LIMIT 1), NOW() + INTERVAL '6 days', 'advanced', 5, 1, false, NULL, ARRAY['mountain bike','helmet','headlamp','warm layer'], 'in_app', true, 'active', 54),
('00000000-0000-0000-0000-000000000010', 'lfg', 'mtb', 'Mid Mountain + Armstrong loop', 'Looking for riding partners for a full Mid Mountain traverse with Armstrong climb. Starting from PCMR base at 9am. Moderate pace with lots of photo stops.', 'Park City Mountain Resort Base', ST_SetSRID(ST_MakePoint(-111.5080, 40.6514), 4326)::geography, (SELECT id FROM trails WHERE slug = 'mid-mountain-trail' LIMIT 1), NOW() + INTERVAL '3 days', 'intermediate', 6, 1, false, NULL, ARRAY['mountain bike','helmet','water','snacks'], 'in_app', true, 'active', 38),

-- St. George / Hurricane
('00000000-0000-0000-0000-000000000011', 'im_going', 'mtb', 'Gooseberry Mesa full send', 'Driving up to Gooseberry for a full day on the mesa. Camping the night before for a sunrise session. All loops plus the white line sections. Experienced riders only.', 'Gooseberry Mesa Trailhead', ST_SetSRID(ST_MakePoint(-113.1500, 37.1400), 4326)::geography, (SELECT id FROM trails WHERE slug = 'gooseberry-mesa' LIMIT 1), NOW() + INTERVAL '7 days', 'advanced', 4, 1, false, NULL, ARRAY['full-suspension bike','helmet','3L water','camping gear'], 'in_app', true, 'active', 72),

-- Zion
('00000000-0000-0000-0000-000000000004', 'lfg', 'hiking', 'Angels Landing early morning', 'Have an Angels Landing permit for Saturday and looking for hiking partners. Meeting at the Grotto shuttle stop at 6am. The early start means fewer people on the chains.', 'The Grotto, Zion', ST_SetSRID(ST_MakePoint(-112.9476, 37.2692), 4326)::geography, (SELECT id FROM trails WHERE slug = 'angels-landing' LIMIT 1), NOW() + INTERVAL '5 days', 'intermediate', 4, 1, true, 'Angels Landing Permit', ARRAY['hiking boots','water','headlamp'], 'in_app', true, 'active', 88),
('00000000-0000-0000-0000-000000000006', 'im_going', 'hiking', 'Narrows full day', 'Planning a full day in the Narrows. Renting gear from Zion Adventure Company at 7am. Going to push as far upriver as conditions allow. All levels welcome for the bottom section.', 'Temple of Sinawava, Zion', ST_SetSRID(ST_MakePoint(-112.9485, 37.2852), 4326)::geography, (SELECT id FROM trails WHERE slug = 'the-narrows-bottom-up' LIMIT 1), NOW() + INTERVAL '4 days', 'intermediate', 6, 1, false, NULL, ARRAY['water shoes','trekking poles','dry bag','lunch'], 'in_app', true, 'active', 63),

-- Bryce Canyon
('00000000-0000-0000-0000-000000000012', 'lfg', 'hiking', 'Fairyland Loop adventure', 'Taking on the full Fairyland Loop at Bryce Canyon. Early start to beat the crowds. Looking for hikers who enjoy a moderate pace with lots of photo stops.', 'Fairyland Point, Bryce Canyon', ST_SetSRID(ST_MakePoint(-112.1500, 37.6400), 4326)::geography, (SELECT id FROM trails WHERE slug = 'fairyland-loop-trail' LIMIT 1), NOW() + INTERVAL '6 days', 'intermediate', 6, 1, false, NULL, ARRAY['hiking boots','3L water','sun protection','lunch'], 'in_app', true, 'active', 41),

-- SLC / Wasatch
('00000000-0000-0000-0000-000000000008', 'im_going', 'hiking', 'Mount Olympus summit push', 'Going for the Mount Olympus summit. Starting at 6am to beat the heat. Bringing crampons in case of lingering snow near the top. Strong hikers welcome.', 'Mount Olympus Trailhead', ST_SetSRID(ST_MakePoint(-111.7700, 40.6570), 4326)::geography, (SELECT id FROM trails WHERE slug = 'mount-olympus' LIMIT 1), NOW() + INTERVAL '3 days', 'advanced', 4, 1, false, NULL, ARRAY['hiking boots','3L water','crampons','sun protection'], 'in_app', true, 'active', 52),

-- Bend
('00000000-0000-0000-0000-000000000008', 'im_going', 'trail_running', 'Deschutes River morning run', 'Easy-paced 10K along the Deschutes River Trail. Starting from the Old Mill District. All paces welcome.', 'Deschutes River Trail', ST_SetSRID(ST_MakePoint(-121.3335, 44.0491), 4326)::geography, (SELECT id FROM trails WHERE slug = 'deschutes-river-trail' LIMIT 1), NOW() + INTERVAL '2 days', 'beginner', 8, 1, false, NULL, ARRAY['trail shoes','water bottle'], 'in_app', true, 'active', 23),
('00000000-0000-0000-0000-000000000001', 'lfg', 'mtb', 'Phil''s Trail after-work ride', 'Looking for riding buddies for a 2-hour loop through Phil''s and Whoops. Meeting at the Phil''s trailhead parking lot at 5pm. Blue-level riders.', 'Phil''s Trail, Bend', ST_SetSRID(ST_MakePoint(-121.3548, 44.0342), 4326)::geography, (SELECT id FROM trails WHERE slug = 'phils-trail-complex' LIMIT 1), NOW() + INTERVAL '1 day', 'intermediate', 6, 1, false, NULL, ARRAY['mountain bike','helmet'], 'in_app', true, 'active', 35),

-- Whistler
('00000000-0000-0000-0000-000000000007', 'im_going', 'mtb', 'A-Line laps all day', 'Planning to spend the whole day lapping A-Line and Dirt Merchant. Got a season pass and looking for people to session with.', 'Whistler Bike Park', ST_SetSRID(ST_MakePoint(-122.9570, 50.0866), 4326)::geography, (SELECT id FROM trails WHERE slug = 'a-line' LIMIT 1), NOW() + INTERVAL '14 days', 'intermediate', 5, 1, false, NULL, ARRAY['full-face helmet','body armor','full-suspension bike'], 'in_app', true, 'active', 89),
('00000000-0000-0000-0000-000000000006', 'lfg', 'hiking', 'High Note Trail hike', 'Doing the High Note Trail this weekend. Planning to take the gondola up and hike across. Looking for hiking partners who enjoy a moderate pace with lots of photo stops.', 'High Note Trail, Whistler', ST_SetSRID(ST_MakePoint(-122.9480, 50.0621), 4326)::geography, (SELECT id FROM trails WHERE slug = 'high-note-trail' LIMIT 1), NOW() + INTERVAL '6 days', 'intermediate', 6, 1, false, NULL, ARRAY['hiking boots','rain jacket','lunch'], 'in_app', true, 'active', 45),

-- Sedona
('00000000-0000-0000-0000-000000000001', 'im_going', 'mtb', 'Hiline sunrise ride', 'Riding Hiline at dawn when the light on the red rocks is magical. Fast-paced ride with some session time on the technical sections.', 'Hiline Trail, Sedona', ST_SetSRID(ST_MakePoint(-111.7670, 34.8310), 4326)::geography, (SELECT id FROM trails WHERE slug = 'hiline-trail' LIMIT 1), NOW() + INTERVAL '4 days', 'advanced', 4, 1, false, NULL, ARRAY['full-suspension bike','helmet','2L water'], 'in_app', true, 'active', 31),
('00000000-0000-0000-0000-000000000004', 'lfg', 'hiking', 'Cathedral Rock sunrise scramble', 'Heading up Cathedral Rock for sunrise this Saturday. The scramble is moderate but bring sticky shoes. Meeting at the Back O'' Beyond trailhead at 5:30am.', 'Cathedral Rock, Sedona', ST_SetSRID(ST_MakePoint(-111.7897, 34.8226), 4326)::geography, (SELECT id FROM trails WHERE slug = 'cathedral-rock-trail' LIMIT 1), NOW() + INTERVAL '3 days', 'intermediate', 6, 1, false, NULL, ARRAY['hiking shoes with good grip','headlamp','water'], 'in_app', true, 'active', 52),

-- Lake Tahoe
('00000000-0000-0000-0000-000000000003', 'im_going', 'mtb', 'Flume Trail shuttle ride', 'Doing the Flume Trail with a shuttle to the top. One of the most scenic rides you will ever do. Moderate pace with lots of photo stops. Meet at Flume Trail Bikes at 9am.', 'Flume Trail, Lake Tahoe', ST_SetSRID(ST_MakePoint(-119.9040, 39.2040), 4326)::geography, (SELECT id FROM trails WHERE slug = 'flume-trail' LIMIT 1), NOW() + INTERVAL '7 days', 'intermediate', 6, 1, false, NULL, ARRAY['mountain bike','helmet','camera'], 'in_app', true, 'active', 76),
('00000000-0000-0000-0000-000000000009', 'lfg', 'kayaking', 'Emerald Bay paddle', 'Planning a morning kayak around Emerald Bay. Calm conditions expected. All levels welcome. Renting from Tahoe Adventure Company at 8am.', 'Emerald Bay, Lake Tahoe', ST_SetSRID(ST_MakePoint(-120.0990, 38.9530), 4326)::geography, NULL, NOW() + INTERVAL '5 days', 'beginner', 8, 1, false, NULL, ARRAY['sunscreen','dry bag for phone'], 'in_app', true, 'active', 38),

-- Finale Ligure
('00000000-0000-0000-0000-000000000011', 'im_going', 'mtb', 'Finale enduro day - Roller Coaster and Cacciatori', 'Shuttling to the top for Roller Coaster and then hitting Cacciatori. Full enduro day in the Ligurian hills. Intermediate to advanced riders welcome. Meeting at Finale Freeride at 9am.', 'Finale Freeride, Finalborgo', ST_SetSRID(ST_MakePoint(8.3435, 44.1693), 4326)::geography, (SELECT id FROM trails WHERE slug = 'roller-coaster-finale' LIMIT 1), NOW() + INTERVAL '8 days', 'advanced', 6, 1, false, NULL, ARRAY['enduro bike','full-face helmet','knee pads','2L water'], 'in_app', true, 'active', 56),
('00000000-0000-0000-0000-000000000012', 'lfg', 'mtb', 'Finale Ligure week-long riding trip', 'Spending a week in Finale riding every trail we can find. Looking for riders to join for individual days or the whole trip. Renting from Finale Freeride and staying at Camping Tahiti.', 'Finale Ligure', ST_SetSRID(ST_MakePoint(8.3435, 44.1693), 4326)::geography, NULL, NOW() + INTERVAL '10 days', 'intermediate', 8, 2, false, NULL, ARRAY['mountain bike or rental','helmet','knee pads'], 'in_app', true, 'active', 82);

-- --------------------------------------------------------------------------
-- 7. Region Highlights
-- --------------------------------------------------------------------------

INSERT INTO region_highlights (region_name, city_slug, center_point, activity_slug, activity_label, activity_emoji, trail_count, business_count, active_posts_count, is_seasonal, best_season)
VALUES
-- Moab
('Moab', 'moab_ut', ST_SetSRID(ST_MakePoint(-109.5498, 38.5733), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 147, 18, 34, true, 'spring'),
('Moab', 'moab_ut', ST_SetSRID(ST_MakePoint(-109.5498, 38.5733), 4326)::geography, 'hiking', 'Hiking', '🥾', 93, 11, 22, false, NULL),
('Moab', 'moab_ut', ST_SetSRID(ST_MakePoint(-109.5498, 38.5733), 4326)::geography, 'climbing', 'Rock Climbing', '🧗', 52, 7, 15, true, 'fall'),
('Moab', 'moab_ut', ST_SetSRID(ST_MakePoint(-109.5498, 38.5733), 4326)::geography, 'kayaking', 'Kayaking / Paddling', '🛶', 12, 5, 9, true, 'summer'),
-- Park City
('Park City', 'park_city_ut', ST_SetSRID(ST_MakePoint(-111.4980, 40.6460), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 134, 12, 28, true, 'summer'),
('Park City', 'park_city_ut', ST_SetSRID(ST_MakePoint(-111.4980, 40.6460), 4326)::geography, 'skiing', 'Skiing', '⛷️', 200, 25, 45, true, 'winter'),
('Park City', 'park_city_ut', ST_SetSRID(ST_MakePoint(-111.4980, 40.6460), 4326)::geography, 'hiking', 'Hiking', '🥾', 98, 8, 20, false, NULL),
-- St. George / Hurricane
('St. George', 'st_george_ut', ST_SetSRID(ST_MakePoint(-113.5684, 37.0965), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 89, 8, 18, false, NULL),
('St. George', 'st_george_ut', ST_SetSRID(ST_MakePoint(-113.5684, 37.0965), 4326)::geography, 'hiking', 'Hiking', '🥾', 65, 5, 12, false, NULL),
-- Zion
('Zion', 'zion_ut', ST_SetSRID(ST_MakePoint(-112.9546, 37.2982), 4326)::geography, 'hiking', 'Hiking', '🥾', 52, 6, 15, true, 'spring'),
('Zion', 'zion_ut', ST_SetSRID(ST_MakePoint(-112.9546, 37.2982), 4326)::geography, 'climbing', 'Rock Climbing', '🧗', 28, 4, 8, true, 'fall'),
('Zion', 'zion_ut', ST_SetSRID(ST_MakePoint(-112.9546, 37.2982), 4326)::geography, 'canyoneering', 'Canyoneering', '🏔️', 18, 5, 10, true, 'spring'),
-- Bryce Canyon
('Bryce Canyon', 'bryce_canyon_ut', ST_SetSRID(ST_MakePoint(-112.1871, 37.6283), 4326)::geography, 'hiking', 'Hiking', '🥾', 35, 4, 8, true, 'summer'),
-- SLC / Wasatch
('Salt Lake City', 'slc_ut', ST_SetSRID(ST_MakePoint(-111.8910, 40.7608), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 156, 15, 32, true, 'summer'),
('Salt Lake City', 'slc_ut', ST_SetSRID(ST_MakePoint(-111.8910, 40.7608), 4326)::geography, 'hiking', 'Hiking', '🥾', 120, 10, 28, false, NULL),
('Salt Lake City', 'slc_ut', ST_SetSRID(ST_MakePoint(-111.8910, 40.7608), 4326)::geography, 'skiing', 'Skiing', '⛷️', 90, 20, 35, true, 'winter'),
-- Ogden
('Ogden', 'ogden_ut', ST_SetSRID(ST_MakePoint(-111.9738, 41.2230), 4326)::geography, 'hiking', 'Hiking', '🥾', 68, 6, 12, false, NULL),
('Ogden', 'ogden_ut', ST_SetSRID(ST_MakePoint(-111.9738, 41.2230), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 45, 5, 8, true, 'summer'),
-- Bend
('Bend', 'bend_or', ST_SetSRID(ST_MakePoint(-121.3153, 44.0582), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 198, 14, 42, true, 'summer'),
('Bend', 'bend_or', ST_SetSRID(ST_MakePoint(-121.3153, 44.0582), 4326)::geography, 'hiking', 'Hiking', '🥾', 124, 8, 28, false, NULL),
('Bend', 'bend_or', ST_SetSRID(ST_MakePoint(-121.3153, 44.0582), 4326)::geography, 'trail_running', 'Trail Running', '🏃', 86, 5, 18, false, NULL),
('Bend', 'bend_or', ST_SetSRID(ST_MakePoint(-121.3153, 44.0582), 4326)::geography, 'skiing', 'Skiing', '⛷️', 45, 12, 24, true, 'winter'),
-- Whistler
('Whistler', 'whistler_bc', ST_SetSRID(ST_MakePoint(-122.9574, 50.1163), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 312, 22, 67, true, 'summer'),
('Whistler', 'whistler_bc', ST_SetSRID(ST_MakePoint(-122.9574, 50.1163), 4326)::geography, 'skiing', 'Skiing', '⛷️', 200, 35, 55, true, 'winter'),
('Whistler', 'whistler_bc', ST_SetSRID(ST_MakePoint(-122.9574, 50.1163), 4326)::geography, 'hiking', 'Hiking', '🥾', 78, 10, 20, true, 'summer'),
-- Sedona
('Sedona', 'sedona_az', ST_SetSRID(ST_MakePoint(-111.7610, 34.8697), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 112, 15, 30, true, 'fall'),
('Sedona', 'sedona_az', ST_SetSRID(ST_MakePoint(-111.7610, 34.8697), 4326)::geography, 'hiking', 'Hiking', '🥾', 156, 12, 38, false, NULL),
('Sedona', 'sedona_az', ST_SetSRID(ST_MakePoint(-111.7610, 34.8697), 4326)::geography, 'trail_running', 'Trail Running', '🏃', 68, 4, 11, false, NULL),
-- Lake Tahoe
('Lake Tahoe', 'lake_tahoe_ca', ST_SetSRID(ST_MakePoint(-120.0324, 39.0968), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 134, 16, 28, true, 'summer'),
('Lake Tahoe', 'lake_tahoe_ca', ST_SetSRID(ST_MakePoint(-120.0324, 39.0968), 4326)::geography, 'hiking', 'Hiking', '🥾', 178, 14, 35, false, NULL),
('Lake Tahoe', 'lake_tahoe_ca', ST_SetSRID(ST_MakePoint(-120.0324, 39.0968), 4326)::geography, 'skiing', 'Skiing', '⛷️', 95, 28, 42, true, 'winter'),
('Lake Tahoe', 'lake_tahoe_ca', ST_SetSRID(ST_MakePoint(-120.0324, 39.0968), 4326)::geography, 'kayaking', 'Kayaking / Paddling', '🛶', 15, 8, 12, true, 'summer'),
-- Finale Ligure
('Finale Ligure', 'finale_ligure_it', ST_SetSRID(ST_MakePoint(8.3435, 44.1693), 4326)::geography, 'mtb', 'Mountain Biking', '🚵', 85, 12, 22, false, NULL),
('Finale Ligure', 'finale_ligure_it', ST_SetSRID(ST_MakePoint(8.3435, 44.1693), 4326)::geography, 'hiking', 'Hiking', '🥾', 42, 6, 10, false, NULL),
('Finale Ligure', 'finale_ligure_it', ST_SetSRID(ST_MakePoint(8.3435, 44.1693), 4326)::geography, 'trail_running', 'Trail Running', '🏃', 28, 3, 6, false, NULL);

COMMIT;

-- ==========================================================================
-- Summary
-- ==========================================================================
-- This seed script inserts:
--   - 12 seed users
--   - 10 permits (Moab, Bend, Sedona, Tahoe, Zion, Bryce, St. George, Park City)
--   - 101 trails across 12 regions:
--       18 Moab, 8 Park City, 6 St. George/Hurricane, 7 Zion,
--       6 Bryce Canyon, 8 SLC/Wasatch, 5 Ogden,
--       9 Bend, 9 Sedona, 7 Lake Tahoe, 7 Whistler, 10 Finale Ligure
--   - 52 businesses across 12 regions:
--       10 Moab, 5 Park City, 3 St. George/Hurricane, 1 Zion,
--       4 SLC, 5 Bend, 5 Sedona, 5 Lake Tahoe, 6 Whistler, 6 Finale Ligure
--       1 Bryce, 1 Ogden
--   - 56 reviews (40 trail + 16 business)
--   - 20 activity posts across all regions
--   - 35 region highlights across 12 regions
-- ==========================================================================
