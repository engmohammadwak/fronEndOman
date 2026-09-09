function renderWishlistPage() {
  const root = document.getElementById('commerce-root');
  if (!root) return;
  const products = resolveWishlistProducts();
  document.title = commerceText('wishlist_page_title', commerceCopy('المفضلة', 'Wishlist')) + ' | TechPro';

  if (!products.length) {
    root.innerHTML = `
      <section class="commerce-card commerce-empty mt-4">
        <span class="material-symbols-outlined">favorite</span>
        <h1 class="text-2xl font-black mt-3">${escapeHtml(commerceCopy('قائمة المفضلة فارغة', 'Your wishlist is empty'))}</h1>
        <p class="text-secondary mt-2">${escapeHtml(commerceCopy('المنتجات التي تحفظها تبقى على هذا الجهاز في التخزين المحلي.', 'Saved items stay on this device in local storage.'))}</p>
        <a class="commerce-btn commerce-btn-primary px-5 mt-5" href="${escapeHtml(getStorefrontPageUrl('catalog.html'))}">${escapeHtml(commerceCopy('تصفح الأجهزة', 'Browse devices'))}</a>
      </section>
    `;
    return;
  }

  root.innerHTML = `
    <div class="flex items-center justify-between mt-4 mb-4">
      <h1 class="text-2xl font-black">${escapeHtml(commerceCopy('المفضلة', 'Wishlist'))} (${products.length})</h1>
      <p class="text-xs text-secondary">${escapeHtml(commerceCopy('محفوظة على جهازك عبر الكوكيز', 'Saved on this device via cookies'))}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      ${products.map((product) => `
        <article class="commerce-card">
          <a href="${escapeHtml(getProductPageUrl(product.id))}" class="block">
            <img class="w-full h-40 object-contain mb-3" alt="${escapeHtml(getLocalizedValue(product, 'name'))}" src="${escapeHtml(safeMediaUrl(product.image, STOREFRONT_PLACEHOLDER_IMAGE))}">
            <h2 class="font-black line-clamp-2 min-h-[3rem]">${escapeHtml(getLocalizedValue(product, 'name'))}</h2>
          </a>
          <div class="flex items-center justify-between mt-3">
            <strong class="text-primary font-mono">${formatCommerceMoney(product.price || 0)}</strong>
            <div class="flex gap-2">
              <button type="button" class="commerce-btn commerce-btn-ghost px-3 text-xs" data-wish-action="remove" data-id="${escapeHtml(product.id)}">${escapeHtml(commerceCopy('إزالة', 'Remove'))}</button>
              <button type="button" class="commerce-btn commerce-btn-green px-3 text-xs" data-wish-action="cart" data-id="${escapeHtml(product.id)}">${escapeHtml(commerceCopy('أضف للسلة', 'Add to cart'))}</button>
            </div>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-wish-action]');
  if (!trigger) return;
  const id = trigger.dataset.id;
  const product = resolveWishlistProducts().find((item) => String(item.id) === String(id));
  if (trigger.dataset.wishAction === 'remove') {
    if (typeof toggleWishlist === 'function') toggleWishlist(id);
    notifyCommerce(commerceCopy('تمت إزالة المنتج من المفضلة', 'Removed from wishlist'), 'info');
  }
  if (trigger.dataset.wishAction === 'cart' && product && typeof addToCart === 'function') {
    const added = addToCart(typeof buildCartPayload === 'function' ? buildCartPayload(product) : { productId: product.id, nameAr: product.nameAr, nameEn: product.nameEn, image: product.image, price: product.price, qty: 1 });
    if (added === false) { notifyCommerce(commerceCopy('الكمية المطلوبة غير متوفرة.', 'Requested quantity is unavailable.'), 'error'); return; }
    notifyCommerce(commerceCopy('تمت إضافة المنتج إلى السلة', 'Added to cart'));
  }
  renderWishlistPage();
});

onStorefrontReady(renderWishlistPage);
window.addEventListener('languageChanged', renderWishlistPage);

window.addEventListener('commerceStateChanged', renderWishlistPage);
