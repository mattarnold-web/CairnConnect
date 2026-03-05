import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidUrl, isValidPhone } from '../../utils/validation';

describe('isValidEmail', () => {
  it('accepts a standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts an email with subdomains', () => {
    expect(isValidEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('rejects an email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects an email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('rejects an email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('accepts a valid https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('accepts a valid http URL', () => {
    expect(isValidUrl('http://example.com/path?q=1')).toBe(true);
  });

  it('rejects a plain string', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts a US-style phone number', () => {
    expect(isValidPhone('(555) 123-4567')).toBe(true);
  });

  it('accepts an international phone number', () => {
    expect(isValidPhone('+1 555 123 4567')).toBe(true);
  });

  it('accepts a simple numeric phone', () => {
    expect(isValidPhone('5551234567')).toBe(true);
  });

  it('rejects a string that is too short', () => {
    expect(isValidPhone('123')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidPhone('')).toBe(false);
  });
});
