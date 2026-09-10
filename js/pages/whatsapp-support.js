/**
 * WhatsApp Dispatcher Module
 * Future: GET /api/settings/public
 */
document.addEventListener('DOMContentLoaded', () => {
  const settings = typeof StoreState !== 'undefined' ? StoreState.getSettings() : {};
  const STORE_SETTINGS = {
    whatsappNumber: settings.whatsappAdmin || window.TECHPRO_CONFIG?.adminWhatsApp || '',
    storeName: (typeof StoreState !== 'undefined' && StoreState.storeDisplayName)
      ? StoreState.storeDisplayName()
      : (settings.storeNameAr || 'الأرض الذكية Smart Earth')
  };

  document.getElementById('wa-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!/^[1-9]\d{7,14}$/.test(STORE_SETTINGS.whatsappNumber)) { showToast('رقم الدعم غير مضبوط بعد / Support number is not configured.', 'info'); return; }

    const topic = document.getElementById('wa-topic').value;
    const orderNo = document.getElementById('wa-order').value.trim();
    const notes = document.getElementById('wa-notes').value.trim();

    const messageLines = [
      `السلام عليكم - متجر ${STORE_SETTINGS.storeName}`,
      `📌 الموضوع: ${topic}`,
      orderNo ? `🔢 رقم الطلب: ${orderNo}` : null,
      notes ? `💬 التفاصيل: ${notes}` : null
    ].filter(Boolean);

    const fullMessage = messageLines.join('\n');
    const waUrl = `https://wa.me/${STORE_SETTINGS.whatsappNumber}?text=${encodeURIComponent(fullMessage)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  });
});
