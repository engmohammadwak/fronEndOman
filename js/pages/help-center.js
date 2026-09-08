/**
 * Help Center Logic (Ready for Dashboard API Integration)
 * Future: GET /api/faqs?lang=ar
 */
const HelpCenterModule = (() => {
  const mockFaqs = [
    {
      id: 1,
      category: 'orders',
      q: 'كم يستغرق توصيل الطلب داخل محافظات سلطنة عُمان؟',
      a: 'يستغرق التوصيل في محافظة مسقط من 24 إلى 48 ساعة عمل، بينما يستغرق التوصيل لبقية المحافظات (ظفار، الباطنة، الداخلية، الشرقية، مسندم) من يومين إلى 4 أيام عمل كحد أقصى.'
    },
    {
      id: 2,
      category: 'returns',
      q: 'ما هي مهلة إرجاع أو استبدال السلعة في حال وجود خلل؟',
      a: 'وفقاً لقانون حماية المستهلك العُماني، يحق للمستهلك طلب استبدال السلعة أو إرجاعها واسترداد ثمنها خلال 15 يوماً من تاريخ الاستلام إذا وجد بها عيب مصنعي أو لم تكن مطابقة للمواصفات القياسية المتفق عليها.'
    },
    {
      id: 3,
      category: 'warranty',
      q: 'هل يشمل الضمان الذهبي الأجهزة المجددة أيضاً؟',
      a: 'الأجهزة المجددة تشمل ضماناً تشغيلياً معتمداً موضحاً على صفحة كل منتج (يبدأ من 6 أشهر إلى سنة كاملة)، بينما الضمان الذهبي الممتد لسنتين مخصص للأجهزة الجديدة المؤهلة.'
    },
    {
      id: 4,
      category: 'orders',
      q: 'هل يمكنني تعديل عنوان التوصيل بعد إتمام الطلب؟',
      a: 'نعم، يمكن تعديل العنوان طالما أن حالة الطلب ما زالت "قيد التجهيز الفني". بمجرد انتقال الطلب إلى حالة "تم الشحن"، يجب التنسيق مباشرة مع شركة التوصيل عبر رقم التتبع.'
    },
    {
      id: 5,
      category: 'orders',
      q: 'هل الشحن مجاني داخل السلطنة؟',
      a: 'الشحن مجاني لجميع الطلبات فوق 200 ر.ع. داخل سلطنة عُمان. الطلبات الأقل تخضع لرسوم توصيل واضحة قبل إتمام الدفع.'
    },
    {
      id: 6,
      category: 'returns',
      q: 'هل يمكن التقسيط عبر تابي أو تمارا ثم الاسترجاع؟',
      a: 'نعم. عند الموافقة على الاسترجاع بعد الفحص الفني، يتم إلغاء عملية التقسيط أو رد المبلغ عبر نفس بوابة الدفع (تابي أو تمارا) وفق سياسة الجهة التمويلية خلال 3 إلى 10 أيام عمل.'
    },
    {
      id: 7,
      category: 'warranty',
      q: 'كيف أطلب صيانة لجهاز ضمن فترة الضمان؟',
      a: 'افتح طلب الصيانة من حسابك أو زر أقرب مركز خدمة معتمد مع رقم الطلب أو الفاتورة. يخضع الجهاز للفحص خلال 3 إلى 7 أيام عمل ثم يتم الإصلاح أو الاستبدال.'
    }
  ];

  let activeCategory = 'all';
  let searchTerm = '';

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const render = () => {
    const listContainer = document.getElementById('faq-list');
    const emptyNotice = document.getElementById('faq-empty');
    const countDisplay = document.getElementById('faq-count');

    if (!listContainer) return;

    const query = searchTerm.toLowerCase();
    const filtered = mockFaqs.filter((item) => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchSearch = !query
        || item.q.toLowerCase().includes(query)
        || item.a.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });

    if (countDisplay) {
      countDisplay.textContent = `${filtered.length} سؤال`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = '';
      emptyNotice?.classList.remove('hidden');
      return;
    }

    emptyNotice?.classList.add('hidden');
    listContainer.innerHTML = filtered.map((item) => `
      <details class="group border border-outline-variant/15 rounded-2xl p-4 transition-all duration-200 open:bg-surface-container-low/30 open:border-primary/30">
        <summary class="flex items-center justify-between font-bold text-sm text-on-surface cursor-pointer list-none select-none">
          <span>${escapeHtml(item.q)}</span>
          <span class="material-symbols-outlined text-outline group-open:rotate-180 group-open:text-primary transition-transform duration-200" aria-hidden="true">
            keyboard_arrow_down
          </span>
        </summary>
        <div class="mt-3 text-xs text-secondary leading-relaxed border-t border-outline-variant/10 pt-3">
          ${escapeHtml(item.a)}
        </div>
      </details>
    `).join('');
  };

  const bindEvents = () => {
    const searchInput = document.getElementById('faq-search');
    searchInput?.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      render();
    });

    const filterButtons = document.querySelectorAll('#faq-categories button');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => {
          b.className = 'cat-pill px-5 py-2 rounded-xl text-xs font-bold transition bg-surface-container-lowest border border-outline-variant/20 hover:border-primary text-secondary';
        });
        btn.className = 'cat-pill active px-5 py-2 rounded-xl text-xs font-bold transition bg-primary text-on-primary';
        activeCategory = btn.dataset.cat;
        render();
      });
    });
  };

  return {
    init: () => {
      bindEvents();
      render();
    }
  };
})();

document.addEventListener('DOMContentLoaded', HelpCenterModule.init);
