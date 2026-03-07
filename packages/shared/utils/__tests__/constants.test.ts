import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ACTIVITY_TYPES, ACTIVITY_TYPE_MAP, ACTIVITY_CATEGORIES } from '../../constants/activityTypes';
import { BUSINESS_CATEGORIES } from '../../constants/categories';
import { ANCHOR_CITIES } from '../../constants/anchorCities';

// ── Activity Types ──────────────────────────────────────────────────

describe('ACTIVITY_TYPES', () => {
  it('should have 29 activity types', () => {
    assert.equal(ACTIVITY_TYPES.length, 29);
  });

  it('should have unique slugs', () => {
    const slugs = ACTIVITY_TYPES.map((a) => a.slug);
    assert.equal(new Set(slugs).size, slugs.length, 'Activity type slugs must be unique');
  });

  it('should have unique sortOrders', () => {
    const orders = ACTIVITY_TYPES.map((a) => a.sortOrder);
    assert.equal(new Set(orders).size, orders.length, 'Sort orders must be unique');
  });

  it('should have required fields on every type', () => {
    for (const at of ACTIVITY_TYPES) {
      assert.ok(at.slug, `Missing slug on activity type`);
      assert.ok(at.label, `Missing label on ${at.slug}`);
      assert.ok(at.emoji, `Missing emoji on ${at.slug}`);
      assert.ok(at.category, `Missing category on ${at.slug}`);
      assert.ok(at.seasons.length > 0, `Empty seasons on ${at.slug}`);
    }
  });

  it('should have all categories represented', () => {
    const categories = new Set(ACTIVITY_TYPES.map((a) => a.category));
    assert.ok(categories.has('mountain'));
    assert.ok(categories.has('water'));
    assert.ok(categories.has('snow'));
    assert.ok(categories.has('air'));
    assert.ok(categories.has('nature'));
  });
});

describe('ACTIVITY_TYPE_MAP', () => {
  it('should map slug to activity type', () => {
    assert.equal(ACTIVITY_TYPE_MAP['hiking'].label, 'Hiking');
    assert.equal(ACTIVITY_TYPE_MAP['mtb'].label, 'Mountain Biking');
  });

  it('should have same count as ACTIVITY_TYPES', () => {
    assert.equal(Object.keys(ACTIVITY_TYPE_MAP).length, ACTIVITY_TYPES.length);
  });
});

describe('ACTIVITY_CATEGORIES', () => {
  it('should have 5 categories', () => {
    assert.equal(ACTIVITY_CATEGORIES.length, 5);
  });

  it('should have unique slugs', () => {
    const slugs = ACTIVITY_CATEGORIES.map((c) => c.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });
});

// ── Business Categories ─────────────────────────────────────────────

describe('BUSINESS_CATEGORIES', () => {
  it('should have entries', () => {
    assert.ok(BUSINESS_CATEGORIES.length > 0, 'Should have at least one business category');
  });

  it('should have unique values', () => {
    const values = BUSINESS_CATEGORIES.map((c) => c.value);
    assert.equal(new Set(values).size, values.length, 'Business category values must be unique');
  });

  it('should have required fields', () => {
    for (const cat of BUSINESS_CATEGORIES) {
      assert.ok(cat.value, 'Missing value');
      assert.ok(cat.label, 'Missing label');
      assert.ok(cat.icon, 'Missing icon');
    }
  });
});

// ── Anchor Cities ───────────────────────────────────────────────────

describe('ANCHOR_CITIES', () => {
  it('should have 13 anchor cities (matching platform regions)', () => {
    assert.equal(ANCHOR_CITIES.length, 13);
  });

  it('should include key regions', () => {
    const names = ANCHOR_CITIES.map((c) => c.name);
    assert.ok(names.some((n) => n.includes('Moab')), 'Should include Moab');
    assert.ok(names.some((n) => n.includes('Bend')), 'Should include Bend');
    assert.ok(names.some((n) => n.includes('Whistler')), 'Should include Whistler');
    assert.ok(names.some((n) => n.includes('Chamonix')), 'Should include Chamonix');
    assert.ok(names.some((n) => n.includes('Queenstown')), 'Should include Queenstown');
  });

  it('should have valid lat/lng coordinates', () => {
    for (const city of ANCHOR_CITIES) {
      assert.ok(city.lat >= -90 && city.lat <= 90, `Invalid lat for ${city.name}: ${city.lat}`);
      assert.ok(city.lng >= -180 && city.lng <= 180, `Invalid lng for ${city.name}: ${city.lng}`);
    }
  });
});

