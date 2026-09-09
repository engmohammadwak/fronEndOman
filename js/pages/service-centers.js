/**
 * Service Centers Directory Module (Ready for GET /api/branches?type=service_center)
 */
const ServiceCentersModule = (() => {
  const mockCenters = [
    {
      id: 1,
      name: 'مركز الصيانة الرئيسي - مسقط',
      city: 'مسقط',
      zone: 'ولاية السيب - الخوض التجارية',
      address: 'شارع مزون، بناية التكنولوجيا، الطابق الأرضي',
      hours: 'السبت - الخميس: 9:00 ص - 9:30 م',
      phone: '+968 2450 1100',
      tags: ['صيانة فورية', 'فحص مجدد', 'استبدال شاشات', 'ضمان ذهبي'],
      mapUrl: 'https://maps.google.com/?q=Al+Khoudh+Muscat'
    },
    {
      id: 2,
      name: 'مركز خدمة الباطنة - صحار',
      city: 'صحار',
      zone: 'منطقة الهمبار',
      address: 'شارع الميناء، بجانب البنك الوطني، مجمع الفراهيدي',
      hours: 'السبت - الخميس: 9:30 ص - 8:30 م',
      phone: '+968 2684 2200',
      tags: ['استلام أجهزة الضمان', 'فحص بطاريات', 'صيانة سوفتوير'],
      mapUrl: 'https://maps.google.com/?q=Sohar+Oman'
    },
    {
      id: 3,
      name: 'مركز صيانة ظفار - صلالة',
      city: 'صلالة',
      zone: 'الوسطى - شارع السلام',
      address: 'مقابل مجمع صلالة التجاري، مبنى التقنية الحديثة',
      hours: 'السبت - الخميس: 10:00 ص - 1:00 م | 4:30 ع - 9:30 م',
      phone: '+968 2329 3300',
      tags: ['خدمات الضمان', 'فحص عتادي', 'قطع غيار أصلية'],
      mapUrl: 'https://maps.google.com/?q=Salalah+Oman'
    },
    {
      id: 4,
      name: 'مركز خدمة الداخلية - نزوى',
      city: 'نزوى',
      zone: 'ولاية نزوى - السوق التقليدي',
      address: 'شارع السلطان قابوس، مجمع نزوى التجاري، الدور الأول',
      hours: 'السبت - الخميس: 9:00 ص - 8:00 م',
      phone: '+968 2541 4400',
      tags: ['فحص مجدد', 'استلام ضمان', 'صيانة برمجية'],
      mapUrl: 'https://maps.google.com/?q=Nizwa+Oman'
    }
  ];

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeHttpUrl(url) {
    if (typeof url !== 'string') return '#';
    const trimmed = url.trim();
    return trimmed.startsWith('https://') || trimmed.startsWith('http://') ? trimmed : '#';
  }

  const render = (filterCity = 'all') => {
    const container = document.getElementById('centers-grid');
    if (!container) return;

    const cmsBranches = typeof StoreState !== 'undefined' ? (StoreState.getCms().branches || []).map((item) => ({
      id: item.id,
      name: document.documentElement.lang === 'en' ? item.nameEn : item.nameAr,
      city: document.documentElement.lang === 'en' ? item.cityEn : item.cityAr,
      zone: item.addressAr || '',
      address: document.documentElement.lang === 'en' ? (item.addressEn || item.addressAr || '') : (item.addressAr || ''),
      hours: document.documentElement.lang === 'en' ? item.hoursEn : item.hoursAr,
      phone: item.phone,
      tags: [],
      mapUrl: item.mapUrl
    })) : [];
    const source = cmsBranches.length ? cmsBranches : mockCenters;
    const filtered = source.filter((c) => filterCity === 'all' || c.city === filterCity);

    container.innerHTML = filtered.map((c) => `
      <div class="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 p-6 shadow-sm flex flex-col justify-between hover:border-primary/40 transition">
        <div>
          <div class="flex items-start justify-between gap-2 mb-3">
            <h3 class="font-black text-base text-on-surface">${escapeHtml(c.name)}</h3>
            <span class="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">${escapeHtml(c.city)}</span>
          </div>

          <p class="text-xs text-secondary flex items-start gap-1.5 mb-2">
            <span class="material-symbols-outlined text-sm text-outline mt-0.5" aria-hidden="true">location_on</span>
            <span>${escapeHtml(c.address)} (${escapeHtml(c.zone)})</span>
          </p>

          <p class="text-xs text-secondary flex items-center gap-1.5 mb-4">
            <span class="material-symbols-outlined text-sm text-outline" aria-hidden="true">schedule</span>
            <span>${escapeHtml(c.hours)}</span>
          </p>

          <div class="border-t border-outline-variant/10 pt-3">
            <span class="text-[10px] font-bold text-secondary block mb-2">الخدمات المتوفرة في هذا الفرع:</span>
            <div class="flex flex-wrap gap-1.5">
              ${c.tags.map((t) => `<span class="bg-surface-container-low text-secondary text-[10px] px-2 py-0.5 rounded-md">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-outline-variant/10">
          <a href="tel:${escapeHtml(c.phone.replace(/\s+/g, ''))}" class="text-center py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold hover:bg-surface-container-low transition">
            اتصال بالفرع
          </a>
          <a href="${escapeHtml(safeHttpUrl(c.mapUrl))}" target="_blank" rel="noopener noreferrer" class="text-center py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:opacity-90 transition flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-sm" aria-hidden="true">map</span>
            الاتجاهات
          </a>
        </div>
      </div>
    `).join('');
  };

  return {
    init: () => {
      render();
      document.getElementById('center-city-filter')?.addEventListener('change', (e) => {
        render(e.target.value);
      });
    }
  };
})();

document.addEventListener('DOMContentLoaded', ServiceCentersModule.init);
