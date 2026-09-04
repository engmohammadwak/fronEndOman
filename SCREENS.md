# فهرس شاشات fronEndOman

## الملفات المؤكدة (من القراءة المباشرة)

| الملف | الوظيفة / العنوان |
|-------|-------------------|
| `code.html` | شعار TechPro (SVG) |
| `code_1.html` | محطة تجهيز وتغليف وشحن الطلبات (WMS Packing Station) |
| `code_2.html` | بوابة الموردين وسلاسل التوريد B2B (SCM / Vendor Portal) |
| `code_12.html` | لوحة التحكم المركزية وإدارة المخزون (Inventory Dashboard) |
| `code_22.html` | مركز مراقبة الخوادم والأنظمة (SRE Hub / DevOps Monitoring) |
| `code_42.html` | مركز العمليات الأمنية والدفاع السيبراني (SOC / Security Operations) |
| `ruun.py` | سكربت Git Manager (upload/download/reset) |

## الملفات المتبقية (41 ملف)

هذي الملفات تحتاج قراءة لاستخراج العناوين من الـ `<h1>` في كل ملف:

- code_3.html
- code_4.html
- code_5.html
- code_6.html
- code_7.html
- code_8.html
- code_9.html
- code_10.html
- code_11.html
- code_13.html
- code_14.html
- code_15.html
- code_16.html
- code_17.html
- code_18.html
- code_19.html
- code_20.html
- code_21.html
- code_23.html
- code_24.html
- code_25.html
- code_26.html
- code_27.html
- code_28.html
- code_29.html
- code_30.html
- code_31.html
- code_32.html
- code_33.html
- code_34.html
- code_35.html
- code_36.html
- code_37.html
- code_38.html
- code_39.html
- code_40.html
- code_41.html
- code_43.html
- code_44.html
- code_45.html

## ملاحظات عامة

- كل الشاشات تستخدم نفس الـ header والـ colors (Material 3 + Tailwind CDN)
- جميع الصفحات مستقلة 100% (مو تطبيق Laravel/Blade)
- الأزرار كلها `alert()` أو `confirm()` (محاكاة فقط)
- الصور من روابط Google الخارجية (lh3.googleusercontent.com)
- النصوص كلها للسعودية (الرياض، ريال سعودي) مو عُمان

## الخطوة التالية

تحويل الشاشات إلى هيكل Laravel Blade:
1. layout واحد للـ header/footer
2. مكونات للألوان والـ KPIs
3. ربط الأزرار بـ API حقيقية
