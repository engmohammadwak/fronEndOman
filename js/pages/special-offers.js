const demoSpecialOffers = [
  {
    id: 1,
    titleAr: 'خصم 25% على شاشات القيمنق',
    titleEn: '25% OFF Gaming Monitors',
    descriptionAr: 'عِش تجربة اللعب القصوى بمعدل تحديث 240Hz وتقنيات OLED.',
    descriptionEn: 'Experience 240Hz refresh rates and cutting-edge OLED panels.',
    discount: 25,
    expiresAt: '2026-09-30T23:59:59',
    productIds: [1, 4],
    image: '../../assets/images/product-placeholder.svg',
    isDemo: true
  },
  {
    id: 2,
    titleAr: 'عرض آيفون 15 مع سماعات هدية',
    titleEn: 'iPhone 15 bundle with free headphones',
    descriptionAr: 'اشترِ آيفون 15 برو واحصل على سماعات لاسلكية مجاناً.',
    descriptionEn: 'Buy iPhone 15 Pro and get wireless headphones free.',
    discount: 12,
    expiresAt: '2026-10-15T23:59:59',
    productIds: [1],
    image: '../../assets/images/product-placeholder.svg',
    isDemo: true
  },
  {
    id: 3,
    titleAr: 'تخفيضات نهاية الأسبوع على اللابتوبات',
    titleEn: 'Weekend laptop markdowns',
    descriptionAr: 'خصم إضافي على أجهزة ماك بوك وسيرفس المحددة.',
    descriptionEn: 'Extra savings on selected MacBook and Surface laptops.',
    discount: 15,
    expiresAt: '2026-09-20T23:59:59',
    productIds: [2],
    image: '../../assets/images/product-placeholder.svg',
    isDemo: true
  },
  {
    id: 4,
    titleAr: 'استبدال جهازك القديم بخصم فوري',
    titleEn: 'Trade in your old device for instant credit',
    descriptionAr: 'قيّم جهازك خلال دقيقتين واحصل على رصيد يصل إلى 2,000 ر.ع.',
    descriptionEn: 'Evaluate your device in two minutes and get up to 2,000 OMR credit.',
    discount: 20,
    expiresAt: '2026-12-31T23:59:59',
    productIds: [3, 5],
    image: '../../assets/images/product-placeholder.svg',
    isDemo: true
  }
];

let pageData = [];
let usingDemoData = true;

async function fetchSpecialOffersFromDashboard() {
  const response = await fetch('../../api/offers');

  if (!response.ok) {
    throw new Error('Failed to load special offers');
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error('Invalid offers response');
  }

  return result.data.map(normalizeOffer);
}

async function loadSpecialOffers() {
  try {
    const dashboardData = await fetchSpecialOffersFromDashboard();

    if (dashboardData.length > 0) {
      pageData = dashboardData;
      usingDemoData = false;
    } else {
      pageData = demoSpecialOffers;
      usingDemoData = true;
    }
  } catch (error) {
    console.warn('Dashboard unavailable, using demo data:', error);
    pageData = demoSpecialOffers;
    usingDemoData = true;
  }

  renderSpecialOffers();
  updateDemoNotice(usingDemoData);
}

function renderOfferCard(offer) {
  const lang = getCurrentLanguage();
  const title = getLocalizedValue(offer, 'title');
  const description = getLocalizedValue(offer, 'description');
  const shopLabel = storefrontText('offer_shop', lang === 'en' ? 'Shop offer' : 'تسوق العرض');
  const expiresLabel = storefrontText('offer_expires', lang === 'en' ? 'Ends in' : 'ينتهي خلال');

  return `
    <article class="flex flex-col bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/10 hover:shadow-xl transition-all min-h-[240px]">
      <div class="flex items-center justify-between mb-4">
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error text-on-error text-xs font-bold">
          <span class="material-symbols-outlined text-sm" aria-hidden="true">local_fire_department</span>
          ${escapeHtml(offer.discount)}%
        </span>
        <span class="text-xs font-bold text-secondary">
          ${escapeHtml(expiresLabel)} ${escapeHtml(formatRemainingTime(offer.expiresAt))}
        </span>
      </div>

      <h2 class="text-lg font-black text-on-surface mb-2">${escapeHtml(title)}</h2>
      <p class="text-secondary text-sm leading-relaxed mb-6">${escapeHtml(description)}</p>

      <a
        href="./new-devices.html"
        class="mt-auto inline-flex items-center justify-center gap-1 px-5 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-bold"
      >
        ${escapeHtml(shopLabel)}
        <span class="material-symbols-outlined text-base ${lang === 'en' ? '' : 'rotate-180'}" aria-hidden="true">arrow_forward</span>
      </a>
    </article>
  `;
}

function renderSpecialOffers() {
  const grid = document.getElementById('offers-grid');
  if (!grid) return;

  setPageCopy('special_offers_page_title', 'special_offers_page_desc');
  grid.innerHTML = pageData.map((offer) => renderOfferCard(offer)).join('');
}

onStorefrontReady(() => {
  loadSpecialOffers();
});

window.addEventListener('languageChanged', () => {
  if (typeof renderSpecialOffers === 'function') {
    renderSpecialOffers();
    updateDemoNotice(usingDemoData);
  }
});
