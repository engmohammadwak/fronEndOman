const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup() {
  const context = vm.createContext({ translations: { ar: {}, en: {} }, document: { addEventListener() {} } });
  vm.runInContext(fs.readFileSync('js/pages/catalog-layout.js', 'utf8'), context);
  return code => vm.runInContext(code, context);
}
test('storage accepts Dashboard fields and demo product descriptions', () => {
  const run = setup();
  assert.equal(run('catalogStorageValue({storageGb: 128})'), '128GB');
  assert.equal(run("catalogStorageValue({extraEn: '1TB SSD'})"), '1024GB');
  assert.equal(run("catalogStorageValue({nameEn: 'Phone 256GB'})"), '256GB');
  assert.equal(run("catalogStorageValue({nameEn: 'Watch'})"), '');
});
test('arabic and english search normalize hamza and taa marbuta', () => {
  const run = setup();
  assert.equal(run("matchesSearchQuery({nameAr:'آيفون 15 برو',nameEn:'iPhone 15 Pro',brand:'Apple'}, 'ايفون')"), true);
  assert.equal(run("matchesSearchQuery({nameAr:'آيفون 15 برو',nameEn:'iPhone 15 Pro',brand:'Apple'}, 'iphone')"), true);
  assert.equal(run("matchesSearchQuery({nameAr:'سماعات سوني',nameEn:'Sony Headphones',brand:'Sony'}, 'سماعه')"), true);
  assert.equal(run("matchesSearchQuery({nameAr:'آيفون 15 برو',nameEn:'iPhone 15 Pro',brand:'Apple'}, 'سيارة')"), false);
});
test('condition and storage selections combine, and reset restores all', () => {
  const run = setup();
  run("catalogConditions = ['Grade A']; catalogStorage = ['256GB']");
  assert.equal(run("catalogMatchesFacets({conditionEn:'Grade A',storageGb:256})"), true);
  assert.equal(run("catalogMatchesFacets({conditionEn:'Grade B',storageGb:256})"), false);
  assert.equal(run("catalogMatchesFacets({conditionEn:'Grade A',storageGb:128})"), false);
  run('catalogConditions = []');
  assert.equal(run("catalogMatchesFacets({conditionEn:'Grade A',storageGb:256})"), false);
  run('catalogConditions = null; catalogStorage = []');
  assert.equal(run('catalogMatchesFacets({})'), true);
});
