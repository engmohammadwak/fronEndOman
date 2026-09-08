/**
 * WhatsApp Dispatcher Module
 * Future: GET /api/settings/public
 */
document.addEventListener('DOMContentLoaded', () => {
  const STORE_SETTINGS = {
    whatsappNumber: '96890000000',
    storeName: 'الأرض الذكية Smart Earth'
  };

  document.getElementById('wa-form')?.addEventListener('submit', (e) => {
    e.preventDefault();

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
