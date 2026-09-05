# دليل تفكيك وتوزيع واجهات منصة تيك برو (Refactoring Workflow Guide)

هذا المستند هو المرجع المباشر لإعادة تنظيم وتفكيك ملفات HTML الفردية لمشروع **TechPro (fronEndOman)** ونقلها إلى الهيكلية المعيارية النظيفة قبل التحويل إلى **Laravel Blade**.

---

## 🎯 المهمة والقواعد الموحدة (Standard Operating Procedure)

بمجرد إرسال كود صفحة كامل (Monolithic HTML):
1. **تحديد الهوية والمسار:** تحديد اسم الصفحة التابعة لقائمة الـ 46 شاشة ومسارها الصحيح داخل `pages/` أو الجذر.
2. **استخراج المكونات المشتركة:**
   - عزل الـ `<header>` إلى `components/header.html` إن وُجد به تعديل، أو استخدام `<div id="header-container"></div>`.
   - عزل الـ `<footer>` إلى `components/footer.html`، أو استخدام `<div id="footer-container"></div>`.
3. **توحيد الـ CSS والمتغيرات:**
   - عدم تكرار وسوم الـ `<style>` العامة ونقلها إلى ملفات الـ CSS المتخصصة (`css/variables.css`, `css/forms.css`, `css/dashboard.css` إلخ).
   - الالتزام بنظام ألوان وهوية المنصة (`primary`, `tertiary`, `surface-container`...).
4. **تفكيك الـ JavaScript:**
   - نقل دوال التنبيه المشتركة (`showToast`) إلى `js/utils/helpers.js`[cite: 3].
   - نقل دوال التحقق والتخزين إلى `js/utils/validation.js` و `js/utils/storage.js`.
   - عزل المنطق البرمجي الخاص بالصفحة فقط إلى ملف مخصص داخل `js/pages/[page-name].js`.
5. **ضبط المسارات النسبية (Relative Paths):**
   - للصفحات داخل `pages/x/`: استخدام `../../css/` و `../../js/` و `../../assets/`.
   - للصفحة الرئيسية `index.html`: استخدام `css/` و `js/` و `assets/`[cite: 2].

---

## 🗂️ خريطة توزيع الملفات المستهدفة

```text
fronEndOman/
│
├── index.html                               # الصفحة الرئيسية النظيفة
│
├── pages/                                   # صفحات النظام (تستخدم مسارات ../../)
│   ├── auth/                                # تسجيل ودخول
│   ├── products/                            # كتالوج، تفاصيل، مقارنة
│   ├── orders/                              # سلة، دفع، فواتير
│   ├── customers/                           # الملف الشخصي وعلاقات العملاء
│   ├── inventory/ & warehouse/              # المخزون والمستودعات
│   ├── maintenance/ & warranty/             # الصيانة والضمان
│   ├── reports/                             # المحاسبة والتحليلات
│   ├── admin/                               # الصلاحيات والموظفين
│   ├── developer/                           # الـ API والـ DevOps
│   ├── security/ & operations/              # الأمان والمراقبة
│   └── unknown/code.html                    # الملف المؤقت
│
├── components/                              # عناصر HTML مجزأة قابلة لإعادة الاستخدام
│   ├── header.html
│   └── footer.html
│
├── css/                                     # تنسيقات مقسمة حسب التخصص
│   ├── variables.css                        # الخطوط والمتغيرات و base styles
│   ├── main.css                             # التنسيق العام
│   ├── components.css                       # الكروت والعناصر
│   ├── forms.css                            # النماذج والمدخلات
│   ├── dashboard.css                        # لوحات التحكم والجداول
│   └── responsive.css                       # التجاوب
│
├── js/                                      # كود الجافاسكربت المفصول
│   ├── tailwind-config.js                   # كائن ثيم Tailwind الموحد
│   ├── main.js                              # التهيئة العامة والعدادات
│   ├── components/                          # منطق السلة، الهيدر، المودال
│   ├── pages/                               # منطق مخصص لكل صفحة (مثلاً login.js)
│   └── utils/                               # helpers.js, validation.js, storage.js
│
└── WORKFLOW_GUIDE.md                        # هذا الملف