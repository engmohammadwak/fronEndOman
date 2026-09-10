const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadAppRoutes() {
  const file = path.join(__dirname, '..', 'js', 'app-routes.js');
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), {
    module,
    exports: module.exports,
    globalThis: {},
    window: undefined
  }, { filename: file });
  return module.exports;
}

const AppRoutes = loadAppRoutes();

test('public routes hide html file locations', () => {
  assert.equal(AppRoutes.page('refurbished-devices.html'), '/refurbished-devices');
  assert.equal(AppRoutes.page('catalog.html'), '/catalog');
  assert.equal(AppRoutes.product(1), '/product?id=1');
  assert.equal(AppRoutes.admin('login'), '/dashboard');
  assert.equal(AppRoutes.admin('payments'), '/dashboard/payments');
  assert.equal(AppRoutes.fileFor('/payment/return'), 'pages/storefront/payment-return.html');
  assert.equal(AppRoutes.fileFor('/dashboard'), 'pages/admin/login.html');
  assert.equal(AppRoutes.fileFor('/dashboard/home'), 'pages/admin/app.html');
  assert.equal(AppRoutes.fileFor('/dashboard/orders'), 'pages/admin/app.html');
  assert.equal(AppRoutes.fileFor('/refurbished-devices'), 'pages/storefront/refurbished-devices.html');
  assert.equal(AppRoutes.LEGACY['/pages/storefront/refurbished-devices.html'], '/refurbished-devices');
});
