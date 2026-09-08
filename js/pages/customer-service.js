const demoFaqs = [
  {
    id: 1,
    questionAr: 'كيف أتابع طلبي؟',
    questionEn: 'How can I track my order?',
    answerAr: 'يمكنك تتبع طلبك من خلال رقم الطلب في حسابك، أو عبر رسالة التأكيد التي تصلك على البريد والواتساب.',
    answerEn: 'You can track your order using the order number in your account, or from the confirmation message sent to email and WhatsApp.',
    category: 'orders',
    isDemo: true
  },
  {
    id: 2,
    questionAr: 'متى يصل الطلب داخل السلطنة؟',
    questionEn: 'When will my order arrive in Oman?',
    answerAr: 'التوصيل داخل المدن الرئيسية خلال 24 ساعة لمعظم الأجهزة المتوفرة في المستودع.',
    answerEn: 'Delivery inside major cities is usually within 24 hours for in-stock devices.',
    category: 'shipping',
    isDemo: true
  },
  {
    id: 3,
    questionAr: 'ما مدة الضمان للأجهزة الجديدة؟',
    questionEn: 'What is the warranty period for new devices?',
    answerAr: 'الأجهزة الجديدة تأتي بضمان ذهبي لمدة سنتين مع اعتماد الوكيل.',
    answerEn: 'New devices include a two-year gold warranty with authorized coverage.',
    category: 'warranty',
    isDemo: true
  },
  {
    id: 4,
    questionAr: 'هل الأجهزة المجددة مشمولة بالضمان؟',
    questionEn: 'Are refurbished devices covered by warranty?',
    answerAr: 'نعم، الأجهزة المجددة مفحوصة من المختبر وتشمل ضمان 6 أشهر وحق إرجاع 14 يوماً.',
    answerEn: 'Yes. Refurbished devices are lab-inspected and include a 6-month warranty plus 14-day returns.',
    category: 'warranty',
    isDemo: true
  },
  {
    id: 5,
    questionAr: 'ما طرق الدفع المتاحة؟',
    questionEn: 'Which payment methods are available?',
    answerAr: 'نقبل مدى، فيزا، ماستركارد، أبل باي، بالإضافة إلى التقسيط عبر تابي وتمارا.',
    answerEn: 'We accept Mada, Visa, Mastercard, Apple Pay, plus Tabby and Tamara installments.',
    category: 'payment',
    isDemo: true
  },
  {
    id: 6,
    questionAr: 'كيف أطلب استرجاع أو استبدال؟',
    questionEn: 'How do I request a return or exchange?',
    answerAr: 'افتح طلب الإرجاع من حسابك خلال 14 يوماً، وسيقوم فريق الخدمة بترتيب الاستلام المجاني.',
    answerEn: 'Open a return request from your account within 14 days, and the service team will arrange free pickup.',
    category: 'returns',
    isDemo: true
  },
  {
    id: 7,
    questionAr: 'هل يمكن تعديل عنوان التوصيل بعد تأكيد الطلب؟',
    questionEn: 'Can I change the delivery address after checkout?',
    answerAr: 'يمكن تعديل العنوان قبل خروج الشحنة من المستودع عبر خدمة العملاء أو من صفحة الطلب.',
    answerEn: 'The address can be changed before the shipment leaves the warehouse via customer service or the order page.',
    category: 'orders',
    isDemo: true
  },
  {
    id: 8,
    questionAr: 'هل الشحن مجاني؟',
    questionEn: 'Is shipping free?',
    answerAr: 'الشحن مجاني لجميع الطلبات فوق 200 ر.ع. داخل السلطنة.',
    answerEn: 'Shipping is free for all orders over 200 OMR inside Oman.',
    category: 'shipping',
    isDemo: true
  }
];

const faqCategories = ['all', 'orders', 'shipping', 'warranty', 'payment', 'returns'];

let pageData = [];
let usingDemoData = true;
let activeFaqCategory = 'all';

async function fetchFaqsFromDashboard() {
  const response = await fetch('../../api/customer-service/faq');

  if (!response.ok) {
    throw new Error('Failed to load customer service FAQ');
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error('Invalid FAQ response');
  }

  return result.data.map(normalizeFaq);
}

async function loadCustomerService() {
  try {
    const dashboardData = await fetchFaqsFromDashboard();

    if (dashboardData.length > 0) {
      pageData = dashboardData;
      usingDemoData = false;
    } else {
      pageData = demoFaqs;
      usingDemoData = true;
    }
  } catch (error) {
    console.warn('Dashboard unavailable, using demo data:', error);
    pageData = demoFaqs;
    usingDemoData = true;
  }

  renderCustomerService();
  updateDemoNotice(usingDemoData);
}

function faqCategoryLabel(category) {
  const key = category === 'all' ? 'faq_all' : `faq_${category}`;
  return storefrontText(key, category);
}

function renderFaqItem(item) {
  const question = getLocalizedValue(item, 'question');
  const answer = getLocalizedValue(item, 'answer');

  return `
    <details class="rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-4 group">
      <summary class="cursor-pointer font-bold text-on-surface flex items-center justify-between gap-3 list-none">
        <span>${escapeHtml(question)}</span>
        <span class="material-symbols-outlined text-secondary group-open:rotate-180 transition-transform" aria-hidden="true">expand_more</span>
      </summary>
      <p class="text-secondary text-sm leading-relaxed mt-3">${escapeHtml(answer)}</p>
    </details>
  `;
}

function renderCustomerService() {
  const list = document.getElementById('faq-list');
  const categories = document.getElementById('faq-categories');
  const faqTitle = document.getElementById('faq-title');
  if (!list) return;

  setPageCopy('customer_service_page_title', 'customer_service_page_desc');
  if (faqTitle) faqTitle.textContent = storefrontText('faq_title', 'الأسئلة الشائعة');

  if (categories) {
    categories.innerHTML = faqCategories.map((category) => `
      <button
        type="button"
        class="faq-category-button px-3 py-1.5 rounded-lg text-sm font-bold border ${
          activeFaqCategory === category
            ? 'bg-primary-container text-on-primary border-primary-container'
            : 'bg-surface-container-lowest text-on-surface border-outline-variant/20'
        }"
        data-category="${escapeHtml(category)}"
      >
        ${escapeHtml(faqCategoryLabel(category))}
      </button>
    `).join('');

    categories.querySelectorAll('.faq-category-button').forEach((button) => {
      button.addEventListener('click', () => {
        activeFaqCategory = button.dataset.category;
        renderCustomerService();
      });
    });
  }

  const visible = pageData.filter((item) => (
    activeFaqCategory === 'all' || item.category === activeFaqCategory
  ));

  list.innerHTML = visible.map((item) => renderFaqItem(item)).join('');
}

onStorefrontReady(() => {
  loadCustomerService();
});

window.addEventListener('languageChanged', () => {
  if (typeof renderCustomerService === 'function') {
    renderCustomerService();
    updateDemoNotice(usingDemoData);
  }
});
