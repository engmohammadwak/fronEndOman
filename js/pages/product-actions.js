function notify(message, type) {
  if (typeof showToast === 'function') showToast(message, type || 'success');
}

function handlePdpClick(event) {
  const trigger = event.target.closest('[data-pdp-action]');
  if (!trigger || !pdpState.product) return;
  const action = trigger.dataset.pdpAction;
  const product = pdpState.product;

  if (action === 'qty') {
    const stock = pdpRemaining(product);
    pdpState.qty = Math.min(stock, Math.max(1, Number(pdpState.qty || 1) + Number(trigger.dataset.delta)));
    renderProductPage();
    return;
  }
  if (action === 'gallery') pdpState.galleryIndex = Number(trigger.dataset.index);
  if (action === 'condition') pdpState.condition = trigger.dataset.condition;
  if (action === 'color') pdpState.colorIndex = Number(trigger.dataset.index);
  if (action === 'storage') pdpState.storageIndex = Number(trigger.dataset.index);
  if (action === 'tab') {
    pdpState.tab = trigger.dataset.tab;
    renderProductPage();
    document.getElementById('pdp-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (action === 'bundle') {
    pdpState.bundle[trigger.dataset.id] = trigger.checked;
  }
  if (action === 'grade') {
    toggleConditionDialog();
    return;
  }
  if (action === 'wishlist') {
    const snapshot = { isDemo: product.isDemo === true, stock: product.stock, nameAr: product.nameAr, nameEn: product.nameEn, image: product.image, price: currentPrice(product), oldPrice: currentOldPrice(product) };
    const added = typeof toggleWishlist === 'function' ? toggleWishlist(product.id, snapshot) : addToWishlist(product.id, snapshot);
    notify(added ? pdpCopy('تمت إضافة المنتج إلى المفضلة.', 'Product added to wishlist.') : pdpCopy('تمت إزالة المنتج من المفضلة.', 'Removed from wishlist.'), added ? 'success' : 'info');
  }
  if (action === 'share') {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: getLocalizedValue(product, 'name'), url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => notify(pdpCopy('تم نسخ رابط المنتج.', 'Product link copied.'), 'info'));
    }
    return;
  }
  if (action === 'cart' || action === 'buy') {
    if (pdpRemaining(product) <= 0) {
      notify(pdpCopy('هذا الجهاز نفد من المخزن.', 'This device is out of stock.'), 'error');
      return;
    }
    const color = product.colors[pdpState.colorIndex];
    const storage = activeStorage(product);
    const variant = activeVariant(product);
    if (typeof addToCart === 'function') {
      const added = addToCart(typeof buildCartPayload === 'function' ? buildCartPayload(product, {
        price: currentPrice(product),
        oldPrice: currentOldPrice(product),
        qty: pdpState.qty || 1,
        conditionAr: variant && variant.labelAr,
        conditionEn: variant && variant.labelEn,
        colorAr: color && color.nameAr,
        colorEn: color && color.nameEn,
        storage: storage ? storage.id : product.storageGb
      }) : { productId: product.id, price: currentPrice(product), qty: pdpState.qty || 1, nameAr: product.nameAr, nameEn: product.nameEn, image: product.image });
      if (added === false) { notify(pdpCopy('الكمية المطلوبة غير متوفرة.', 'Requested quantity is unavailable.'), 'error'); return; }
    }
    notify(action === 'buy'
      ? pdpCopy('تمت إضافة المنتج وجارٍ تجهيز الطلب.', 'Added to cart. Preparing checkout.')
      : pdpCopy('تمت إضافة المنتج إلى السلة بنجاح.', 'Product added to cart.'));
    if (action === 'buy') {
      window.location.href = typeof getStorefrontPageUrl === 'function' ? getStorefrontPageUrl('checkout.html') : 'checkout.html';
      return;
    }
  }
  if (action === 'bundle-cart') {
    product.accessories.forEach((item) => {
      if (pdpState.bundle[item.id] === false) return;
      if (typeof addToCart === 'function') {
        addToCart({
          productId: `bundle-${product.id}-${item.id}`,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          image: item.image,
          price: Math.round(Number(item.price) * 0.85),
          qty: 1
        });
      }
    });
    notify(pdpCopy('تمت إضافة الحزمة بخصم 15%.', 'Bundle added with 15% off.'));
  }
  if (action === 'report') {
    notify(pdpCopy('تقرير الفحص غير متاح للتنزيل بعد.', 'The inspection report is not available for download yet.'), 'info');
    return;
  }
  if (action === 'write-review') {
    notify(pdpCopy('خدمة إضافة التقييم غير مربوطة بعد.', 'Review submission is not connected yet.'), 'info');
    return;
  }

  renderProductPage();
}

let conditionDialogTrigger = null;
function toggleConditionDialog() {
  const modal = document.getElementById('condition-modal');
  if (!modal) return;
  const opening = !modal.classList.contains('is-open');
  modal.classList.toggle('is-open', opening);
  if (opening) { conditionDialogTrigger = document.activeElement; modal.querySelector('button')?.focus(); }
  else conditionDialogTrigger?.focus();
}
document.addEventListener('keydown', event => {
  const modal = document.getElementById('condition-modal');
  if (!modal?.classList.contains('is-open')) return;
  if (event.key === 'Escape') { event.preventDefault(); toggleConditionDialog(); }
  if (event.key !== 'Tab') return;
  const targets = modal.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]');
  const first = targets[0], last = targets[targets.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});
