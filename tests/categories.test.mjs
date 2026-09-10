import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CATEGORIES, mapCategoryRow, slugify } from '../server/categories.mjs';

test('category defaults include bilingual phone and laptop entries', () => {
  assert.ok(DEFAULT_CATEGORIES.length >= 5);
  const phones = DEFAULT_CATEGORIES.find((item) => item.slug === 'phones');
  assert.equal(phones.nameAr, 'هواتف ذكية');
  assert.equal(phones.nameEn, 'Smartphones');
});

test('mapCategoryRow normalizes MySQL and local shapes', () => {
  const mapped = mapCategoryRow({
    id: '3',
    slug: 'gaming',
    name_ar: 'ألعاب',
    name_en: 'Gaming',
    icon: 'sports_esports',
    sort_order: 50,
    is_active: 1
  });
  assert.equal(mapped.id, 3);
  assert.equal(mapped.nameAr, 'ألعاب');
  assert.equal(mapped.active, true);
  assert.equal(slugify('Smart Phones!!'), 'smart-phones');
});
