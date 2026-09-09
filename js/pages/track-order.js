/**
 * Track Order Module (Ready for GET /api/orders/track)
 */
const TrackOrderModule = (() => {
  const mockOrders = {
    'SE-2026-00128': {
      orderId: 'SE-2026-00128',
      recipient: 'محمد بن أحمد الهنائي',
      city: 'مسقط - الخوض',
      currentStep: 3,
      statusBadge: 'تم الشحن وهو في الطريق',
      orderDate: '07 سبتمبر 2026',
      expectedDate: '10 سبتمبر 2026',
      courier: 'أوتار إكسبريس (عُمان)',
      trackingNumber: 'OM-EXP-99201',
      items: [
        { name: 'Samsung Galaxy S24 Ultra (مجدد - فئة A+)', qty: 1, price: '389.000 ر.ع' }
      ]
    },
    'SE-2026-00129': {
      orderId: 'SE-2026-00129',
      recipient: 'سالم المعمري',
      city: 'صحار',
      currentStep: 2,
      statusBadge: 'قيد الفحص والتجهيز الفني',
      orderDate: '08 سبتمبر 2026',
      expectedDate: '12 سبتمبر 2026',
      courier: 'البريد السريع',
      trackingNumber: 'OM-EXP-44102',
      items: [
        { name: 'شاحن جداري GaN بقوة 65W', qty: 2, price: '18.000 ر.ع' }
      ]
    }
  };

  const steps = [
    { num: 1, title: 'تم تأكيد الطلب' },
    { num: 2, title: 'التجهيز الفني' },
    { num: 3, title: 'تم الشحن' },
    { num: 4, title: 'تم التسليم' }
  ];

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const renderResult = (order) => {
    const container = document.getElementById('track-result');
    if (!container) return;

    const timelineHtml = `
      <div class="relative my-8">
        <div class="absolute top-1/2 left-0 right-0 h-1 bg-surface-container -translate-y-1/2 z-0 hidden md:block"></div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          ${steps.map((s) => {
            const isDone = s.num <= order.currentStep;
            const isCurrent = s.num === order.currentStep;
            return `
              <div class="flex flex-col items-center text-center bg-surface-container-lowest md:bg-transparent p-3 rounded-xl border md:border-0 border-outline-variant/10">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  isDone ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}">
                  ${isDone ? '✓' : s.num}
                </div>
                <span class="text-xs font-bold mt-2 ${isDone ? 'text-on-surface' : 'text-outline'}">${escapeHtml(s.title)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-6 lg:p-8 shadow-sm">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-outline-variant/10 pb-5">
          <div>
            <span class="text-[11px] text-secondary font-bold">معلومات الشحنة للطلب:</span>
            <h3 class="text-lg font-black font-mono mt-0.5">${escapeHtml(order.orderId)}</h3>
          </div>
          <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            ${escapeHtml(order.statusBadge)}
          </span>
        </div>

        ${timelineHtml}

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-low/30 p-4 rounded-2xl text-xs mt-6">
          <div>
            <p class="text-secondary mb-1">العميل والوجهة</p>
            <p class="font-bold text-on-surface">${escapeHtml(order.recipient)} (${escapeHtml(order.city)})</p>
          </div>
          <div>
            <p class="text-secondary mb-1">تاريخ الوصول المتوقع</p>
            <p class="font-bold text-primary">${escapeHtml(order.expectedDate)}</p>
          </div>
          <div>
            <p class="text-secondary mb-1">شركة الشحن والتتبع</p>
            <p class="font-bold font-mono text-on-surface">${escapeHtml(order.courier)} - ${escapeHtml(order.trackingNumber)}</p>
          </div>
        </div>

        <div class="mt-6 border-t border-outline-variant/10 pt-4">
          <p class="text-xs font-bold mb-3 text-secondary">العناصر المشمولة:</p>
          <div class="space-y-2">
            ${order.items.map((item) => `
              <div class="flex justify-between items-center text-xs p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/10">
                <span class="font-medium">${escapeHtml(item.name)} <span class="text-secondary">× ${escapeHtml(item.qty)}</span></span>
                <span class="font-bold font-mono">${escapeHtml(item.price)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  };

  const renderNotFound = () => {
    const container = document.getElementById('track-result');
    if (!container) return;
    container.innerHTML = `
      <div class="bg-surface-container-lowest rounded-3xl border border-error/20 p-8 text-center">
        <span class="material-symbols-outlined text-error text-4xl mb-2">cancel</span>
        <h4 class="text-sm font-bold text-error">لم نتمكن من العثور على بيانات هذا الطلب</h4>
        <p class="text-xs text-secondary mt-1">يرجى التأكد من كتابة الرقم بدقة مثل: SE-2026-00128</p>
      </div>
    `;
  };

  return {
    init: () => {
      renderResult(mockOrders['SE-2026-00128']);

      document.getElementById('track-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const orderNo = document.getElementById('track-order-no').value.trim();
        const live = typeof StoreState !== 'undefined'
          ? StoreState.getOrders().find((item) => item.orderId === orderNo || `#${item.orderId}` === orderNo)
          : null;
        const statusStep = { received: 1, processing: 2, shipped: 3, delivered: 4, cancelled: 1 };
        const found = live ? {
          orderId: live.orderId,
          recipient: live.customerName || '',
          city: live.address || '',
          currentStep: statusStep[live.status] || 2,
          statusBadge: ({ received: 'تم استلام الطلب', processing: 'قيد الفحص والتجهيز', shipped: 'تم الشحن مع الأسطول', delivered: 'تم التسليم', cancelled: 'ملغي' }[live.status] || live.status),
          orderDate: live.createdAt || '',
          expectedDate: '24-48h',
          courier: 'TechPro Express',
          trackingNumber: live.orderId,
          items: (live.items || []).map((item) => ({
            name: item.nameAr || item.nameEn || '',
            qty: item.qty || 1,
            price: `${item.price || 0}`
          }))
        } : mockOrders[orderNo];

        if (found) {
          renderResult(found);
          if (typeof showToast === 'function') {
            showToast('تم تحديث بيانات الطلب', 'success');
          }
        } else {
          renderNotFound();
        }
      });
    }
  };
})();

document.addEventListener('DOMContentLoaded', TrackOrderModule.init);
