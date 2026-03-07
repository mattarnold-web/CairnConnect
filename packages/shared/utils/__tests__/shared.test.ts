import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { haversineDistance, formatDistance, formatElevation, formatDuration, formatSpeed } from '../distance';
import { formatRating, formatReviewCount, slugify, formatDate, formatDateTime, timeUntil } from '../format';
import { isValidEmail, isValidUrl, isValidPhone } from '../validation';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_MAP, ACTIVITY_CATEGORIES } from '../../constants/activityTypes';
import { BUSINESS_CATEGORIES } from '../../constants/categories';
import { ANCHOR_CITIES } from '../../constants/anchorCities';

// ── Distance Utilities ──────────────────────────────────────────────

describe('haversineDistance', () => {
  it('should return 0 for same point', () => {
    assert.equal(haversineDistance(38.57, -109.55, 38.57, -109.55), 0);
  });

  it('should calculate correct distance between Moab and Boulder', () => {
    // Moab, UT to Boulder, CO is ~285 km
    const dist = haversineDistance(38.5733, -109.5498, 40.0150, -105.2705);
    assert.ok(dist > 350 && dist < 450, `Expected ~400km, got ${dist}`);
  });

  it('should be symmetric', () => {
    const d1 = haversineDistance(38.57, -109.55, 40.01, -105.27);
    const d2 = haversineDistance(40.01, -105.27, 38.57, -109.55);
    assert.ok(Math.abs(d1 - d2) < 0.001, 'Distance should be symmetric');
  });
});

describe('formatDistance', () => {
  it('should format metric distances in meters', () => {
    assert.equal(formatDistance(500), '500 m');
  });

  it('should format metric distances in km', () => {
    assert.equal(formatDistance(5000), '5.0 km');
  });

  it('should format imperial distances in miles', () => {
    assert.equal(formatDistance(5000, 'imperial'), '3.1 mi');
  });

  it('should format small imperial distances in feet', () => {
    assert.equal(formatDistance(30, 'imperial'), '98 ft');
  });
});

describe('formatElevation', () => {
  it('should format metric elevation', () => {
    assert.equal(formatElevation(1500), '1500 m');
  });

  it('should format imperial elevation', () => {
    assert.equal(formatElevation(1000, 'imperial'), '3281 ft');
  });
});

describe('formatDuration', () => {
  it('should format minutes only', () => {
    assert.equal(formatDuration(600), '10m');
  });

  it('should format hours only', () => {
    assert.equal(formatDuration(7200), '2h');
  });

  it('should format hours and minutes', () => {
    assert.equal(formatDuration(5400), '1h 30m');
  });
});

describe('formatSpeed', () => {
  it('should format metric speed', () => {
    assert.equal(formatSpeed(10), '36.0 km/h');
  });

  it('should format imperial speed', () => {
    assert.equal(formatSpeed(10, 'imperial'), '22.4 mph');
  });
});

// ── Format Utilities ─────────────────────────────────────────────────

describe('formatRating', () => {
  it('should format to 1 decimal', () => {
    assert.equal(formatRating(4.567), '4.6');
    assert.equal(formatRating(5), '5.0');
  });
});

describe('formatReviewCount', () => {
  it('should format small counts as-is', () => {
    assert.equal(formatReviewCount(42), '42');
  });

  it('should format thousands with k', () => {
    assert.equal(formatReviewCount(1500), '1.5k');
  });
});

describe('slugify', () => {
  it('should convert text to slug', () => {
    assert.equal(slugify('Delicate Arch Trail'), 'delicate-arch-trail');
  });

  it('should handle special characters', () => {
    assert.equal(slugify('Café & Bike Shop!'), 'caf-bike-shop');
  });

  it('should trim leading/trailing dashes', () => {
    assert.equal(slugify(' --Hello World-- '), 'hello-world');
  });
});

// ── Validation Utilities ─────────────────────────────────────────────

describe('isValidEmail', () => {
  it('should accept valid emails', () => {
    assert.ok(isValidEmail('user@example.com'));
    assert.ok(isValidEmail('test+tag@domain.co.uk'));
  });

  it('should reject invalid emails', () => {
    assert.ok(!isValidEmail('not-an-email'));
    assert.ok(!isValidEmail('@missing-user.com'));
    assert.ok(!isValidEmail('user@'));
  });
});

describe('isValidUrl', () => {
  it('should accept valid URLs', () => {
    assert.ok(isValidUrl('https://cairnconnect.app'));
    assert.ok(isValidUrl('http://localhost:3000'));
  });

  it('should reject invalid URLs', () => {
    assert.ok(!isValidUrl('not a url'));
    assert.ok(!isValidUrl('ftp://'));
  });
});

describe('isValidPhone', () => {
  it('should accept valid phone numbers', () => {
    assert.ok(isValidPhone('+1 (435) 259-1234'));
    assert.ok(isValidPhone('4352591234'));
  });

  it('should reject invalid phone numbers', () => {
    assert.ok(!isValidPhone('abc'));
    assert.ok(!isValidPhone('12'));
  });
});

