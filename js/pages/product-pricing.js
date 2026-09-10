function activeVariant(product) {
  return product.variants.find((item) => item.type === pdpState.condition) || product.variants[0];
}

function activeStorage(product) {
  return product.storageOptions[pdpState.storageIndex] || product.storageOptions[0] || null;
}

function currentPrice(product) {
  const storage = activeStorage(product);
  const variant = activeVariant(product);
  if (storage && product.variants.length < 2) {
    return Number(storage.price);
  }
  if (storage && variant) {
    const delta = Number(storage.price) - Number(product.storageOptions[0].price);
    return Number(variant.price) + delta;
  }
  return Number((variant && variant.price) || product.price);
}

function currentOldPrice(product) {
  const storage = activeStorage(product);
  const variant = activeVariant(product);
  const old = (variant && variant.oldPrice) || (storage && storage.oldPrice) || product.oldPrice;
  return old != null ? Number(old) : null;
}

function bundleTotal(product) {
  return product.accessories.reduce((sum, item) => (
    pdpState.bundle[item.id] === false ? sum : sum + Number(item.price)
  ), 0);
}

