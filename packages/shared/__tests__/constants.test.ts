import { describe, it, expect } from 'vitest';
import { CAIRN_COLORS } from '../constants/colors';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_MAP, ACTIVITY_CATEGORIES } from '../constants/activityTypes';

describe('CAIRN_COLORS', () => {
  it('is defined', () => {
    expect(CAIRN_COLORS).toBeDefined();
  });

  it('has cairn, canopy, and spotlight color groups', () => {
    expect(CAIRN_COLORS).toHaveProperty('cairn');
    expect(CAIRN_COLORS).toHaveProperty('canopy');
    expect(CAIRN_COLORS).toHaveProperty('spotlight');
  });

  it('cairn group contains expected keys', () => {
    expect(CAIRN_COLORS.cairn).toHaveProperty('bg');
    expect(CAIRN_COLORS.cairn).toHaveProperty('card');
    expect(CAIRN_COLORS.cairn).toHaveProperty('border');
  });

  it('canopy has a DEFAULT color', () => {
    expect(CAIRN_COLORS.canopy.DEFAULT).toBe('#10B981');
  });
});

describe('ACTIVITY_TYPES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(ACTIVITY_TYPES)).toBe(true);
    expect(ACTIVITY_TYPES.length).toBeGreaterThan(0);
  });

  it('each activity has required fields', () => {
    for (const activity of ACTIVITY_TYPES) {
      expect(activity).toHaveProperty('slug');
      expect(activity).toHaveProperty('label');
      expect(activity).toHaveProperty('emoji');
      expect(activity).toHaveProperty('category');
      expect(activity).toHaveProperty('seasons');
      expect(activity).toHaveProperty('sortOrder');
      expect(typeof activity.slug).toBe('string');
      expect(typeof activity.label).toBe('string');
      expect(Array.isArray(activity.seasons)).toBe(true);
    }
  });

  it('contains hiking activity', () => {
    const hiking = ACTIVITY_TYPES.find((a) => a.slug === 'hiking');
    expect(hiking).toBeDefined();
    expect(hiking?.label).toBe('Hiking');
    expect(hiking?.category).toBe('mountain');
  });

  it('has unique slugs', () => {
    const slugs = ACTIVITY_TYPES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('ACTIVITY_TYPE_MAP', () => {
  it('is an object keyed by slug', () => {
    expect(ACTIVITY_TYPE_MAP).toBeDefined();
    expect(ACTIVITY_TYPE_MAP['hiking']).toBeDefined();
    expect(ACTIVITY_TYPE_MAP['hiking'].label).toBe('Hiking');
  });

  it('has the same number of entries as ACTIVITY_TYPES', () => {
    expect(Object.keys(ACTIVITY_TYPE_MAP).length).toBe(ACTIVITY_TYPES.length);
  });
});

describe('ACTIVITY_CATEGORIES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(ACTIVITY_CATEGORIES)).toBe(true);
    expect(ACTIVITY_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('each category has slug, label, and emoji', () => {
    for (const cat of ACTIVITY_CATEGORIES) {
      expect(cat).toHaveProperty('slug');
      expect(cat).toHaveProperty('label');
      expect(cat).toHaveProperty('emoji');
    }
  });

  it('includes the mountain category', () => {
    const mountain = ACTIVITY_CATEGORIES.find((c) => c.slug === 'mountain');
    expect(mountain).toBeDefined();
  });
});
