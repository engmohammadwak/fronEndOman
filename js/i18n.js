// ========================================
// Internationalization (i18n) - Unified Translations
// ========================================
const translations = {
  ar: {
    // Header
    banner_text: 'شحن مجاني لجميع الطلبات فوق 200 ريال | ضمان ذهبي لمدة عامين',
    store_desc: 'متجر الأجهزة والتقنية المعتمد',
    all_departments: 'جميع الأقسام',
    phones: 'الجوالات',
    laptops: 'اللابتوبات',
    accessories: 'الإكسسوارات',
    search_placeholder: 'ابحث عن جهاز، علامة تجارية، أو مواصفات...',
    cart_label: 'سلة المشتريات (0)',
    my_account: 'حسابي',
    nav_home: 'الرئيسية',
    nav_new_devices: 'الأجهزة الجديدة',
    nav_refurbished: 'الأجهزة المستعملة والمجددة',
    nav_special_offers: 'العروض الخاصة',
    nav_brands: 'الماركات',
    nav_customer_service: 'خدمة العملاء',
    fast_delivery: 'توصيل سريع خلال 24 ساعة',
    lang_btn: 'English',
    
    // Value Propositions
    value_fast_shipping_title: 'شحن سريع 24 ساعة',
    value_fast_shipping_desc: 'توصيل آمن لجميع مدن المملكة',
    value_warranty_title: 'ضمان ذهبي معتمد',
    value_warranty_desc: 'سنتان للجديد و 6 أشهر للمستعمل',
    value_inspection_title: 'فحص تقني 40 نقطة',
    value_inspection_desc: 'اعتماد هندسي للأجهزة المجددة',
    value_installment_title: 'تقسيط تابي وتمارا',
    value_installment_desc: 'قسّم فاتورتك بدون فوائد',
    
    // Hero Section
    hero_badge: 'تخفيضات الموسم الكبرى 2026',
    hero_title: 'عصر التكنولوجيا بأسعار استثنائية',
    hero_subtitle: 'جديد ومجدد بموثوقية 100%',
    hero_desc: 'احصل على أقوى أجهزة iPhone 15 Pro Max ولابتوبات MacBook Pro مع رقاقة M3 فائقة القوة بتوفير يصل حتى 35% مع باقة هدايا تيك برو الحصرية.',
    hero_btn_new: 'تسوق الأجهزة الجديدة الآن',
    hero_btn_refurbished: 'الأجهزة المستعملة المضمونة',
    hero_trust: 'أكثر من 150,000 عميل يثقون بجودة أجهزتنا المعتمدة',
    hero_image_badge_title: 'فحص دقيق مجاز',
    hero_image_badge_desc: 'مع بطاقة التقرير الإلكتروني',
    
    // Categories
    categories_title: 'تسوق حسب الفئات',
    categories_desc: 'اختر مجالك وتصفح آلاف الأجهزة الحديثة والمجددة',
    categories_view_all: 'تصفح الكل',
    cat_phones: 'هواتف ذكية',
    cat_phones_count: '1,420 جهاز',
    cat_laptops: 'حواسيب ولابتوبات',
    cat_laptops_count: '840 جهاز',
    cat_tablets: 'أجهزة لوحية',
    cat_tablets_count: '320 جهاز',
    cat_watches: 'ساعات وسماعات',
    cat_watches_count: '615 جهاز',
    cat_accessories: 'ملحقات وإكسسوارات',
    cat_accessories_count: '2,100 منتج',
    cat_gaming: 'شاشات وألعاب',
    cat_gaming_count: '480 جهاز',
    
    // New Arrivals
    new_arrivals_title: 'أحدث الأجهزة الجديدة كلياً',
    new_arrivals_subtitle: '● أصلي 100% بضمان الوكيل المعتمد سنتين',
    view_all: 'عرض الكل',
    badge_new: 'جديد',
    badge_discount: 'خصم 18%',
    product_1_name: 'آبل آيفون 15 برو - تيتانيوم طبيعي سعة 256 جيجابايت',
    product_1_stock: 'متوفر في المستودع الرئيسي (+50 نقطة)',
    product_2_name: 'ماك بوك برو M3 بشاشة 14 إنش - رامات 18GB و 512GB SSD',
    product_2_stock: 'متوفر في المستودع (+80 نقطة)',
    product_3_name: 'ساعة سامسونج جالاكسي ووتش 6 كلاسيك مقاس 47 مم',
    product_3_stock: 'متوفر في المستودع (+30 نقطة)',
    product_4_name: 'سماعات سوني WH-1000XM5 اللاسلكية العازلة للضوضاء',
    product_4_stock: 'متوفر في المستودع (+40 نقطة)',
    add_to_cart: 'إضافة',
    
    // Promotional Banners
    promo_flash_title: 'عروض الفلاش الأسبوعية',
    promo_flash_desc: 'خصم 25% على شاشات وكروت شاشة القيمنق',
    promo_flash_subdesc: 'عِش تجربة اللعب القصوى بمعدل تحديث 240Hz وتقنيات OLED الرائدة.',
    promo_flash_hours: 'ساعة',
    promo_flash_minutes: 'دقيقة',
    promo_flash_seconds: 'ثانية',
    promo_flash_btn: 'تسوق عروض القيمنق',
    promo_trade_title: 'برنامج الاستبدال السريع',
    promo_trade_desc: 'بدّل جهازك القديم بقسيمة تصل إلى 2,000 ريال',
    promo_trade_subdesc: 'قيّم هاتفك أو حاسوبك خلال دقائق واستلم فوراً رصيد تيك برو لشراء جهازك المفضل.',
    promo_trade_speed: 'تقييم خلال دقيقتين',
    promo_trade_pickup: 'استلام مجاني من بابك',
    promo_trade_btn: 'ابدأ تقييم جهازك الآن',
    
    // Refurbished Section
    refurbished_badge: 'معتمدة من مختبرات تيك برو الهندسية',
    refurbished_title: 'أجهزة مجددة ومستعملة بجودة كالجديدة',
    refurbished_desc: 'فحص 40 نقطة تقنية مع ضمان 6 أشهر وحق الاسترجاع لمدة 14 يوماً',
    refurbished_view_all: 'استكشف سوق المستعمل',
    condition_a_plus: 'كالجديد A+',
    condition_a: 'ممتاز A',
    condition_b_plus: 'جيد جداً B+',
    savings_label: 'وفرت',
    with_original_box: 'مع العلبة الأصلية',
    with_apple_pencil: '+ قلم آبل هدية',
    with_controllers: 'مع يدين تحكم',
    disc_version: 'نسخة الأقراص',
    buy_now: 'شراء',
    
    // Product Names (Refurbished)
    refurb_product_1_name: 'آيفون 14 برو ماكس 256 جيجابايت - بنفسجي عميق (مجدد معتمد)',
    refurb_product_1_battery: '🔋 بطارية 95%',
    refurb_product_1_storage: '256GB',
    refurb_product_1_old_price: '4,800 ر.ع.',
    refurb_product_2_name: 'لابتوب ديل XPS 13 إنتل كور i7 - شاشة 4K لمسية مجدد',
    refurb_product_2_battery: '🔋 بطارية 100%',
    refurb_product_2_specs: 'i7 • 16GB',
    refurb_product_2_old_price: '4,650 ر.ع.',
    refurb_product_3_name: 'آيباد برو 11 إنش شريحة M2 مساحة 128GB مع قلم ذكي',
    refurb_product_3_battery: '🔋 بطارية 91%',
    refurb_product_3_specs: 'Apple M2',
    refurb_product_3_old_price: '3,499 ر.ع.',
    refurb_product_4_name: 'بلايستيشن 5 نسخة الأقراص مستعمل ومفحوص مع يدين تحكم',
    refurb_product_4_controllers: '🎮 2 يد أصلية',
    refurb_product_4_version: 'نسخة الأقراص',
    refurb_product_4_old_price: '2,399 ر.ع.',
    
    // Customer Reviews
    reviews_title: 'ماذا يقول عملاؤنا عن تيك برو؟',
    reviews_desc: 'تجارب حقيقية موثقة لعملاء حصلوا على أجهزة جديدة ومجددة مع خدمات الضمان',
    review_1_text: '"اشتريت آيفون 14 برو ماكس مستعمل مجدد، الصراحة الجهاز وصل بدون أي خدش نهائياً والبطارية 96%! التغليف فخم والتوصيل أخذ أقل من 24 ساعة للرياض."',
    review_1_name: 'فيصل الشهري',
    review_1_badge: 'مشترٍ موثق - الرياض',
    review_2_text: '"تجربة شراء ماك بوك برو M3 الجديد كانت ممتازة. السعر أقل من الوكيل بـ 400 ريال مع تقسيط ميسر عن طريق تمارا بدون فوائد وخدمة عملاء ردوا فوراً."',
    review_2_name: 'نورة القحطاني',
    review_2_badge: 'مشترية موثقة - جدة',
    review_3_text: '"برنامج الاستبدال وفر علي وقت كبير، استبدلت جهازي القديم بقيمة عادلة جداً وأخذت بلايستيشن 5 مجدد مع الضمان. متجر تيك برو أصبح خياري الأول."',
    review_3_name: 'عبدالعزيز المنصور',
    review_3_badge: 'مشترٍ موثق - الدمام',
    
    // Newsletter
    newsletter_badge: 'كوبون 50 ريال لطلبك الأول',
    newsletter_title: 'انضم إلى مجتمع تيك برو السري',
    newsletter_desc: 'اشترك ليصلك إشعار فوري فور نزول دفعات الأجهزة المجددة النادرة وتخفيضات الفلاش الأسبوعية الحصرية قبل الجميع.',
    newsletter_placeholder: 'name@example.com',
    newsletter_btn: 'اشترك الآن',
    newsletter_success: 'تم اشتراكك بنجاح! تم إرسال كوبون الخصم 50 ريال إلى بريدك.',
    
    // Main Content
    main_title: 'محتوى الصفحة الرئيسية',
    main_desc: 'الهيدر والفوتر يتم تحميلهم ديناميكياً! ✅',
    btn_add_cart: 'إضافة منتج للسلة (150 ر.ع.)',
    btn_add_wishlist: 'إضافة للمفضلة',
    btn_clear_cart: 'إفراغ السلة',
    
    // Footer
    footer_about_title: 'عن تيك برو TechPro',
    footer_about_desc: 'منصة رائدة لتجارة الأجهزة والمنتجات التقنية الحديثة والمجددة بأعلى معايير الجودة والضمان المعتمد في الشرق الأوسط.',
    footer_about_verified: 'سجل تجاري موثق وترخيص رسمي',
    footer_support_title: 'خدمة العملاء والدعم',
    footer_support_help: 'مركز المساعدة والأسئلة الشائعة',
    footer_support_track: 'تتبع حالة الطلب',
    footer_support_whatsapp: 'التواصل عبر واتساب المباشر',
    footer_support_service: 'مراكز الصيانة المعتمدة',
    footer_policies_title: 'سياسات الشراء والضمان',
    footer_policies_warranty: 'شروط الضمان الذهبي لعامين',
    footer_policies_return: 'سياسة الاستبدال والاسترجاع السهل',
    footer_policies_inspection: 'معايير فحص الأجهزة المجددة',
    footer_policies_privacy: 'سياسة الخصوصية وأمان البيانات',
    footer_payment_title: 'طرق الدفع والشحن',
    footer_payment_desc: 'خيارات دفع إلكتروني آمنة وتقسيط مرن مع شركائنا المعتمدين.',
    payment_mada: 'مدى',
    payment_visa: 'فيزا',
    payment_mastercard: 'ماستركارد',
    payment_tabi: 'تابي',
    payment_tamara: 'تمارا',
    payment_apple: 'أبل باي',
    footer_copyright: 'جميع الحقوق محفوظة © 2026 تيك برو TechPro. موثق في المركز السعودي للأعمال.',
    footer_tech: 'صُمم بأحدث التقنيات السريعة والآمنة'
  },
  en: {
    // Header
    banner_text: 'Free shipping on all orders over 200 OMR | 2-year Gold Warranty',
    store_desc: 'Certified Devices & Technology Store',
    all_departments: 'All Departments',
    phones: 'Phones',
    laptops: 'Laptops',
    accessories: 'Accessories',
    search_placeholder: 'Search for a device, brand, or specs...',
    cart_label: 'Shopping Cart (0)',
    my_account: 'My Account',
    nav_home: 'Home',
    nav_new_devices: 'New Devices',
    nav_refurbished: 'Refurbished Devices',
    nav_special_offers: 'Special Offers',
    nav_brands: 'Brands',
    nav_customer_service: 'Customer Service',
    fast_delivery: 'Fast delivery within 24 hours',
    lang_btn: 'عربي',
    
    // Value Propositions
    value_fast_shipping_title: '24h Fast Shipping',
    value_fast_shipping_desc: 'Secure delivery across the kingdom',
    value_warranty_title: 'Certified Gold Warranty',
    value_warranty_desc: '2 years for new, 6 months for used',
    value_inspection_title: '40-Point Tech Inspection',
    value_inspection_desc: 'Engineering approval for refurbished devices',
    value_installment_title: 'Tabby & Tamara Installments',
    value_installment_desc: 'Split your bill interest-free',
    
    // Hero Section
    hero_badge: 'Biggest Season Sale 2026',
    hero_title: 'The Era of Technology at Exceptional Prices',
    hero_subtitle: 'New & Refurbished with 100% Reliability',
    hero_desc: 'Get the most powerful iPhone 15 Pro Max and MacBook Pro laptops with M3 ultra-powerful chip with up to 35% savings plus exclusive TechPro gift bundle.',
    hero_btn_new: 'Shop New Devices Now',
    hero_btn_refurbished: 'Certified Refurbished Devices',
    hero_trust: 'Over 150,000 customers trust our certified device quality',
    hero_image_badge_title: 'Certified Precision Inspection',
    hero_image_badge_desc: 'With electronic report card',
    
    // Categories
    categories_title: 'Shop by Categories',
    categories_desc: 'Choose your category and browse thousands of new and refurbished devices',
    categories_view_all: 'View All',
    cat_phones: 'Smartphones',
    cat_phones_count: '1,420 devices',
    cat_laptops: 'Laptops & Computers',
    cat_laptops_count: '840 devices',
    cat_tablets: 'Tablets',
    cat_tablets_count: '320 devices',
    cat_watches: 'Watches & Earbuds',
    cat_watches_count: '615 devices',
    cat_accessories: 'Accessories',
    cat_accessories_count: '2,100 products',
    cat_gaming: 'Gaming & Monitors',
    cat_gaming_count: '480 devices',
    
    // New Arrivals
    new_arrivals_title: 'Latest Brand New Devices',
    new_arrivals_subtitle: '● 100% Original with 2-year authorized warranty',
    view_all: 'View All',
    badge_new: 'New',
    badge_discount: '18% OFF',
    product_1_name: 'Apple iPhone 15 Pro - Natural Titanium 256GB',
    product_1_stock: 'Available in main warehouse (+50 points)',
    product_2_name: 'MacBook Pro M3 14-inch - 18GB RAM & 512GB SSD',
    product_2_stock: 'Available in warehouse (+80 points)',
    product_3_name: 'Samsung Galaxy Watch 6 Classic 47mm',
    product_3_stock: 'Available in warehouse (+30 points)',
    product_4_name: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    product_4_stock: 'Available in warehouse (+40 points)',
    add_to_cart: 'Add',
    
    // Promotional Banners
    promo_flash_title: 'Weekly Flash Deals',
    promo_flash_desc: '25% OFF on Gaming Monitors & Graphics Cards',
    promo_flash_subdesc: 'Experience ultimate gaming with 240Hz refresh rate and cutting-edge OLED technology.',
    promo_flash_hours: 'Hours',
    promo_flash_minutes: 'Minutes',
    promo_flash_seconds: 'Seconds',
    promo_flash_btn: 'Shop Gaming Deals',
    promo_trade_title: 'Quick Trade-In Program',
    promo_trade_desc: 'Trade your old device for up to 2,000 OMR voucher',
    promo_trade_subdesc: 'Evaluate your phone or laptop in minutes and instantly receive TechPro credit for your next purchase.',
    promo_trade_speed: '2-minute evaluation',
    promo_trade_pickup: 'Free doorstep pickup',
    promo_trade_btn: 'Start Device Evaluation',
    
    // Refurbished Section
    refurbished_badge: 'Certified by TechPro Engineering Labs',
    refurbished_title: 'Refurbished & Used Devices - Like New Quality',
    refurbished_desc: '40-point technical inspection with 6-month warranty and 14-day return policy',
    refurbished_view_all: 'Explore Used Market',
    condition_a_plus: 'Like New A+',
    condition_a: 'Excellent A',
    condition_b_plus: 'Very Good B+',
    savings_label: 'You saved',
    with_original_box: 'With original box',
    with_apple_pencil: '+ Free Apple Pencil',
    with_controllers: 'With 2 controllers',
    disc_version: 'Disc version',
    buy_now: 'Buy',
    
    // Product Names (Refurbished)
    refurb_product_1_name: 'iPhone 14 Pro Max 256GB - Deep Purple (Certified Refurbished)',
    refurb_product_1_battery: '🔋 Battery 95%',
    refurb_product_1_storage: '256GB',
    refurb_product_1_old_price: '4,800 OMR',
    refurb_product_2_name: 'Dell XPS 13 Intel Core i7 - 4K Touchscreen Refurbished',
    refurb_product_2_battery: '🔋 Battery 100%',
    refurb_product_2_specs: 'i7 • 16GB',
    refurb_product_2_old_price: '4,650 OMR',
    refurb_product_3_name: 'iPad Pro 11-inch M2 Chip 128GB with Smart Pen',
    refurb_product_3_battery: '🔋 Battery 91%',
    refurb_product_3_specs: 'Apple M2',
    refurb_product_3_old_price: '3,499 OMR',
    refurb_product_4_name: 'PlayStation 5 Disc Edition Used & Tested with 2 Controllers',
    refurb_product_4_controllers: '🎮 2 Original Controllers',
    refurb_product_4_version: 'Disc version',
    refurb_product_4_old_price: '2,399 OMR',
    
    // Customer Reviews
    reviews_title: 'What Our Customers Say About TechPro?',
    reviews_desc: 'Real documented experiences from customers who got new and refurbished devices with warranty services',
    review_1_text: '"I bought a refurbished iPhone 14 Pro Max used, honestly the device arrived without any scratches at all and battery 96%! Packaging was premium and delivery took less than 24 hours to Riyadh."',
    review_1_name: 'Faisal Al-Shahri',
    review_1_badge: 'Verified Buyer - Riyadh',
    review_2_text: '"The experience of buying the new MacBook Pro M3 was excellent. Price was 400 OMR less than the dealer with easy installments via Tamara interest-free and customer service responded immediately."',
    review_2_name: 'Noura Al-Qahtani',
    review_2_badge: 'Verified Buyer - Jeddah',
    review_3_text: '"The trade-in program saved me a lot of time, I traded my old device for a very fair value and got a refurbished PlayStation 5 with warranty. TechPro store has become my first choice."',
    review_3_name: 'Abdulaziz Al-Mansour',
    review_3_badge: 'Verified Buyer - Dammam',
    
    // Newsletter
    newsletter_badge: '50 OMR Coupon for Your First Order',
    newsletter_title: 'Join TechPro Secret Community',
    newsletter_desc: 'Subscribe to get instant notifications when rare refurbished device batches drop and exclusive weekly flash discounts before everyone else.',
    newsletter_placeholder: 'name@example.com',
    newsletter_btn: 'Subscribe Now',
    newsletter_success: 'Successfully subscribed! 50 OMR discount coupon sent to your email.',
    
    // Main Content
    main_title: 'Homepage Content',
    main_desc: 'Header and footer loaded dynamically! ✅',
    btn_add_cart: 'Add to Cart (150 OMR)',
    btn_add_wishlist: 'Add to Wishlist',
    btn_clear_cart: 'Clear Cart',
    
    // Footer
    footer_about_title: 'About TechPro',
    footer_about_desc: 'Leading platform for trading modern and refurbished devices and tech products with highest quality standards and certified warranty in the Middle East.',
    footer_about_verified: 'Verified commercial registration and official license',
    footer_support_title: 'Customer Service & Support',
    footer_support_help: 'Help Center & FAQs',
    footer_support_track: 'Track Order Status',
    footer_support_whatsapp: 'Direct WhatsApp Contact',
    footer_support_service: 'Certified Service Centers',
    footer_policies_title: 'Purchase & Warranty Policies',
    footer_policies_warranty: '2-Year Gold Warranty Terms',
    footer_policies_return: 'Easy Return & Exchange Policy',
    footer_policies_inspection: 'Refurbished Devices Inspection Standards',
    footer_policies_privacy: 'Privacy Policy & Data Security',
    footer_payment_title: 'Payment & Shipping Methods',
    footer_payment_desc: 'Secure electronic payment options and flexible installments with our certified partners.',
    payment_mada: 'Mada',
    payment_visa: 'Visa',
    payment_mastercard: 'Mastercard',
    payment_tabi: 'Tabby',
    payment_tamara: 'Tamara',
    payment_apple: 'Apple Pay',
    footer_copyright: 'All rights reserved © 2026 TechPro. Registered in Saudi Business Center.',
    footer_tech: 'Designed with latest fast and secure technologies'
  }
};

let currentLang = 'ar';

// تغيير اللغة
function toggleLanguage() {
  const html = document.documentElement;
  const langText = document.getElementById('lang-text');
  
  if (currentLang === 'ar') {
    html.setAttribute('dir', 'ltr');
    html.setAttribute('lang', 'en');
    currentLang = 'en';
  } else {
    html.setAttribute('dir', 'rtl');
    html.setAttribute('lang', 'ar');
    currentLang = 'ar';
  }
  
  updateTextDirection();
  updateAllTexts();
  if (langText) langText.textContent = translations[currentLang].lang_btn;
  localStorage.setItem('lang', currentLang);
}

// تحديث اتجاه النصوص
function updateTextDirection() {
  const heroContent = document.querySelector('.hero-content');
  
  if (heroContent) {
    if (currentLang === 'en') {
      heroContent.classList.remove('text-right');
      heroContent.classList.add('text-left');
    } else {
      heroContent.classList.remove('text-left');
      heroContent.classList.add('text-right');
    }
  }
}

// تحديث كل النصوص بناءً على اللغة
function updateAllTexts() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[currentLang][key]) {
      el.placeholder = translations[currentLang][key];
    }
  });
  
  updateTextDirection();
}

// تحميل اللغة المحفوظة
function loadSavedLanguage() {
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    currentLang = savedLang;
    const langText = document.getElementById('lang-text');
    const html = document.documentElement;
    
    html.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', savedLang);
    if (langText) langText.textContent = translations[savedLang].lang_btn;
    
    updateAllTexts();
  }
}
