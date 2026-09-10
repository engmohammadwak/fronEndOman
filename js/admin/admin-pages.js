window.renderAdminPage = function renderAdminPage() {
  if (!AdminAuth.guard()) return;
  try {
  StoreState.ensure();
  const page = document.body.dataset.adminPage;
  ({
    overview: renderOverview,
    pos: renderPos,
    products: renderProducts,
    categories: renderCategories,
    inventory: renderInventory,
    orders: renderOrders,
    customers: renderCustomers,
    coupons: renderCoupons,
    cms: renderCms,
    content: renderContent,
    settings: renderSettings,
    payments: renderPayments
  }[page] || renderOverview)();
  } catch (error) {
    const host = document.getElementById('admin-app');
    if (host) {
      host.textContent = `${error && error.message ? error.message : 'Unable to load dashboard'} / تعذّر تحميل لوحة العرض`;
      console.error(error);
    }
  }
};

// AdminAuth starts rendering only after server session verification.
