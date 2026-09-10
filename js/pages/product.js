async function loadCatalogFromApi() {
  try { return apiList(await requestApi('catalog/products')).map(normalizeProduct); }
  catch { return null; }
}
async function loadProductFromApi(id) {
  try {
    const data = await requestApi(`products/${encodeURIComponent(id)}`);
    const raw = data.product || data.data || data;
    if (!raw || raw.id == null) throw new Error('Invalid product');
    return normalizePdpProduct(raw);
  } catch { return null; }
}

function demoCatalog() {
  return Array.isArray(window.STOREFRONT_DEMO_PRODUCTS) ? window.STOREFRONT_DEMO_PRODUCTS
    : (typeof STOREFRONT_DEMO_PRODUCTS !== 'undefined' ? STOREFRONT_DEMO_PRODUCTS : []);
}

function readRequestedId() {
  return new URLSearchParams(window.location.search).get('id')
    || new URLSearchParams(window.location.search).get('product');
}

async function initProductPage() {
  const requestedId = readRequestedId();
  const apiCatalog = await loadCatalogFromApi();
  pdpState.catalog = apiCatalog || (isDemoMode() ? demoCatalog() : []);
  pdpState.usingDemo = !apiCatalog;
  if (typeof StoreState !== 'undefined') {
    StoreState.syncFromCatalog(pdpState.catalog);
    pdpState.catalog = pdpState.catalog.map((item) => StoreState.applyLiveProduct(item));
  }

  let product = null;
  if (requestedId) {
    const apiProduct = await loadProductFromApi(requestedId);
    if (apiProduct) {
      product = apiProduct;
      pdpState.usingDemo = false;
    } else {
      product = pdpState.catalog.find((item) => String(item.id) === String(requestedId)) || null;
    }
  } else {
    product = pdpState.catalog[0] || null;
  }

  if (product) {
    const live = typeof StoreState !== 'undefined' ? StoreState.applyLiveProduct(product) : product;
    pdpState.product = enrichPdpProduct(live, pdpState.catalog);
    pdpState.qty = 1;
    pdpState.condition = listingTypeOf(pdpState.product);
    const matchStorage = pdpState.product.storageOptions.findIndex((item) => Number(item.id) === Number(product.storageGb));
    pdpState.storageIndex = matchStorage >= 0 ? matchStorage : 0;
    pdpState.galleryIndex = 0;
    pdpState.colorIndex = 0;
    pdpState.tab = 'specs';
    pdpState.bundle = {};
  } else {
    pdpState.product = null;
  }

  renderProductPage();
}

document.addEventListener('click', handlePdpClick);
window.addEventListener('languageChanged', () => {
  if (pdpState.product) {
    pdpState.product = enrichPdpProduct(pdpState.product, pdpState.catalog);
  }
  renderProductPage();
});

onStorefrontReady(initProductPage);
