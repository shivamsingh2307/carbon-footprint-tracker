import { describe, test, expect } from 'vitest';
import { escapeHTML, sanitizeString, sanitizeNumber, sanitizeDate, sanitizeId } from '../src/utils/sanitize.js';

describe('Sanitization Utils', () => {
  test('escapeHTML should convert dangerous chars to HTML entities', () => {
    expect(escapeHTML('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    expect(escapeHTML('John & Doe')).toBe('John &amp; Doe');
    expect(escapeHTML("O'Connor")).toBe('O&#x27;Connor');
  });

  test('sanitizeString should trim, slice, and escape', () => {
    expect(sanitizeString('   Hello World   ')).toBe('Hello World');
    expect(sanitizeString('   <script>   ', 5)).toBe('&lt;sc');
  });

  test('sanitizeNumber should clamp and validate numbers', () => {
    expect(sanitizeNumber('123.45')).toBe(123.45);
    expect(sanitizeNumber(-10, 0, 100)).toBe(0);
    expect(sanitizeNumber(150, 0, 100)).toBe(100);
    expect(sanitizeNumber('invalid')).toBe(0);
  });

  test('sanitizeDate should return valid YYYY-MM-DD', () => {
    expect(sanitizeDate('2026-06-09')).toBe('2026-06-09');
    expect(sanitizeDate('invalid-date')).toBe(new Date().toISOString().split('T')[0]);
    expect(sanitizeDate('2026/06/09')).toBe(new Date().toISOString().split('T')[0]);
  });

  test('sanitizeId should allow only safe characters for HTML IDs', () => {
    expect(sanitizeId('safe-id_123')).toBe('safe-id_123');
    expect(sanitizeId('bad id <input>')).toBe('badidinput');
  });
});
