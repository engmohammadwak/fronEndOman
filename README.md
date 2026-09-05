# 🇴🇲 fronEndOman - TechPro UI Screens

مستودع واجهات المستخدم لمنصة **TechPro**، ويحتوي على شاشات HTML مستقلة تم تطويرها كمرحلة **UI Prototype / Mockup** قبل تحويلها إلى تطبيق فعلي باستخدام **Laravel + Blade**.

---

# 🇸🇦 العربية

## 📌 حالة المشروع

* 🎨 واجهات مستخدم فقط **UI Prototype**
* 🌐 كل شاشة موجودة في ملف HTML مستقل
* 🚧 المشروع الحالي **ليس تطبيق Laravel**
* 🔄 سيتم لاحقًا تحويل الشاشات إلى **Laravel Blade Templates**
* 📱 الواجهات تمثل شاشات النظام المطلوبة قبل بدء التطوير البرمجي الكامل
* 🧩 المشروع مبني حاليًا باستخدام **Vanilla HTML, CSS & JavaScript**

---

## 📊 عدد الصفحات

يوجد حاليًا:

* **45 صفحة معروفة** (`code_1.html` → `code_45.html`)
* **ملف إضافي واحد غير محدد** (`code.html`)
* **إجمالي ملفات HTML: 46**

> `code.html` لم يتم تحديد وظيفة الصفحة الخاصة به حتى الآن، لذلك سيتم الاحتفاظ به ضمن `pages/unknown/` إلى أن يتم تحديد محتواه.

---

# 📂 الصفحات

|  # | File                                    | الصفحة                              |
| -: | --------------------------------------- | ----------------------------------- |
|  1 | `order-fulfillment.html`                | إتمام الطلبات                       |
|  2 | `supplier-procurement-management.html`  | إدارة الموردين والمشتريات           |
|  3 | `maintenance-warranty-management.html`  | إدارة الصيانة والضمان               |
|  4 | `register.html`                         | إنشاء حساب                          |
|  5 | `about.html`                            | من نحن                              |
|  6 | `login.html`                            | تسجيل الدخول                        |
|  7 | `api-gateway-management.html`           | إدارة بوابة API                     |
|  8 | `customer-profile.html`                 | ملف العميل                          |
|  9 | `backup-disaster-recovery.html`         | النسخ الاحتياطي والتعافي من الكوارث |
| 10 | `ai-recommendation-models.html`         | نماذج التوصيات بالذكاء الاصطناعي    |
| 11 | `deployment-devops-center.html`         | مركز النشر وDevOps                  |
| 12 | `inventory-management.html`             | إدارة المخزون                       |
| 13 | `distributed-tracing-performance.html`  | التتبع الموزع والأداء               |
| 14 | `developer-portal.html`                 | بوابة المطورين                      |
| 15 | `help-center.html`                      | مركز المساعدة                       |
| 16 | `device-comparison.html`                | مقارنة الأجهزة                      |
| 17 | `warehouse-logistics-management.html`   | إدارة المستودعات والخدمات اللوجستية |
| 18 | `security-audit-log.html`               | سجل التدقيق الأمني                  |
| 19 | `financial-reports-accounting.html`     | التقارير المالية والمحاسبة          |
| 20 | `customer-relationship-management.html` | إدارة علاقات العملاء                |
| 21 | `help-center-2.html`                    | مركز المساعدة - نسخة إضافية         |
| 22 | `system-monitoring.html`                | مراقبة النظام                       |
| 23 | `membership-levels.html`                | مستويات العضوية                     |
| 24 | `security-audit-log-2.html`             | سجل التدقيق الأمني - نسخة إضافية    |
| 25 | `log-management.html`                   | إدارة السجلات                       |
| 26 | `cdn-edge-management.html`              | إدارة CDN وEdge                     |
| 27 | `order-confirmation.html`               | تأكيد الطلب                         |
| 28 | `event-stream-management.html`          | إدارة تدفق الأحداث                  |
| 29 | `api-partner-management.html`           | إدارة شركاء API                     |
| 30 | `employee-roles-permissions.html`       | أدوار وصلاحيات الموظفين             |
| 31 | `account-order-summary.html`            | ملخص الحساب والطلبات                |
| 32 | `configuration-secrets-management.html` | إدارة الإعدادات والأسرار            |
| 33 | `index.html`                            | الصفحة الرئيسية                     |
| 34 | `promotions-coupons-management.html`    | إدارة العروض والكوبونات             |
| 35 | `permissions-access-matrix.html`        | مصفوفة الصلاحيات والوصول            |
| 36 | `iphone-15-pro-max.html`                | iPhone 15 Pro Max                   |
| 37 | `shipping-payment-completion.html`      | إتمام الشحن والدفع                  |
| 38 | `device-catalog.html`                   | كتالوج الأجهزة                      |
| 39 | `warranty-replacement-policy.html`      | سياسة الضمان والاستبدال             |
| 40 | `data-analytics-management.html`        | إدارة وتحليلات البيانات             |
| 41 | `central-lab-inspection.html`           | فحص المعمل المركزي                  |
| 42 | `security-operations-center-soc.html`   | مركز العمليات الأمنية (SOC)         |
| 43 | `trade-in.html`                         | الاستبدال (Trade-In)                |
| 44 | `incident-management.html`              | إدارة الحوادث                       |
| 45 | `product-details.html`                  | تفاصيل المنتج                       |

### ❓ ملف غير محدد

| الملف       | الحالة                  |
| ----------- | ----------------------- |
| `code.html` | لم يتم تحديد الصفحة بعد |

---

# 🗂️ هيكل المشروع

المشروع عبارة عن **Frontend متعدد الصفحات** باستخدام Vanilla HTML, CSS & JavaScript.

```text
fronEndOman/
│
├── index.html
│
├── pages/
│   │
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   │
│   ├── products/
│   │   ├── device-catalog.html
│   │   ├── device-comparison.html
│   │   ├── iphone-15-pro-max.html
│   │   ├── product-details.html
│   │   └── trade-in.html
│   │
│   ├── orders/
│   │   ├── order-fulfillment.html
│   │   ├── order-confirmation.html
│   │   └── shipping-payment-completion.html
│   │
│   ├── customers/
│   │   ├── customer-profile.html
│   │   ├── customer-relationship-management.html
│   │   ├── account-order-summary.html
│   │   └── membership-levels.html
│   │
│   ├── inventory/
│   │   └── inventory-management.html
│   │
│   ├── warehouse/
│   │   └── warehouse-logistics-management.html
│   │
│   ├── maintenance/
│   │   └── maintenance-warranty-management.html
│   │
│   ├── warranty/
│   │   └── warranty-replacement-policy.html
│   │
│   ├── reports/
│   │   ├── financial-reports-accounting.html
│   │   └── data-analytics-management.html
│   │
│   ├── admin/
│   │   ├── employee-roles-permissions.html
│   │   ├── permissions-access-matrix.html
│   │   └── promotions-coupons-management.html
│   │
│   ├── developer/
│   │   ├── developer-portal.html
│   │   ├── api-gateway-management.html
│   │   ├── api-partner-management.html
│   │   ├── deployment-devops-center.html
│   │   └── configuration-secrets-management.html
│   │
│   ├── security/
│   │   ├── security-audit-log.html
│   │   ├── security-audit-log-2.html
│   │   ├── incident-management.html
│   │   └── log-management.html
│   │
│   ├── operations/
│   │   ├── system-monitoring.html
│   │   ├── central-lab-inspection.html
│   │   ├── security-operations-center-soc.html
│   │   ├── event-stream-management.html
│   │   ├── distributed-tracing-performance.html
│   │   └── cdn-edge-management.html
│   │
│   └── unknown/
│       └── code.html
│
├── components/
│   ├── header.html
│   └── footer.html
│
├── assets/
│   ├── images/
│   │   ├── products/
│   │   ├── banners/
│   │   ├── categories/
│   │   └── general/
│   │
│   ├── icons/
│   └── fonts/
│
├── css/
│   ├── variables.css
│   ├── main.css
│   ├── components.css
│   ├── header.css
│   ├── footer.css
│   ├── product-card.css
│   ├── forms.css
│   ├── dashboard.css
│   └── responsive.css
│
├── js/
│   ├── main.js
│   │
│   ├── components/
│   │   ├── header.js
│   │   ├── footer.js
│   │   ├── modal.js
│   │   └── cart.js
│   │
│   ├── pages/
│   │   ├── products.js
│   │   ├── product-details.js
│   │   ├── checkout.js
│   │   ├── login.js
│   │   └── dashboard.js
│   │
│   └── utils/
│       ├── helpers.js
│       ├── validation.js
│       └── storage.js
│
└── README.md
```

---

# 🧩 المكونات المشتركة

يتم فصل العناصر المشتركة عن الصفحات، مثل:

```text
components/
├── header.html
└── footer.html
```

بحيث لا نكرر الـNavbar والـFooter داخل كل صفحة.

مثال:

```html
<div id="header"></div>

<main>
    <!-- Page Content -->
</main>

<div id="footer"></div>
```

ويمكن تحميل المكونات باستخدام JavaScript.

---

# 🎨 CSS

يتم تقسيم CSS حسب المسؤولية لتجنب إنشاء ملف CSS ضخم:

```text
css/
├── variables.css
├── main.css
├── components.css
├── header.css
├── footer.css
├── product-card.css
├── forms.css
├── dashboard.css
└── responsive.css
```

---

# ⚡ JavaScript

يتم تقسيم JavaScript إلى:

### Components

```text
js/components/
```

للأجزاء المشتركة مثل:

* Header
* Footer
* Modal
* Cart

### Pages

```text
js/pages/
```

للمنطق الخاص بكل صفحة.

### Utils

```text
js/utils/
```

للدوال المساعدة مثل:

* Validation
* Local Storage
* Helpers

---

# ⚠️ ملاحظات مهمة

* هذه المرحلة عبارة عن **UI Prototype فقط**.
* المشروع الحالي **ليس تطبيق Laravel**.
* لا يوجد Backend حقيقي في هذه المرحلة.
* لا توجد قاعدة بيانات مرتبطة بالواجهات.
* سيتم لاحقًا تحويل الواجهات إلى Laravel Blade.
* يجب الحفاظ على وظائف وتصميم الصفحات أثناء عملية التحويل قدر الإمكان.

---

# 🚀 المرحلة القادمة

سيتم تحويل المشروع تدريجيًا إلى تطبيق Laravel منظم.

التحويل سيشمل:

```text
HTML
 ↓
Blade
 ↓
Routes
 ↓
Controllers
 ↓
Models
 ↓
Database
 ↓
Authentication
 ↓
API / Backend
```

وسيتم تنظيم ملفات Blade لاحقًا داخل:

```text
resources/
└── views/
    ├── layouts/
    ├── components/
    ├── auth/
    ├── products/
    ├── orders/
    ├── customers/
    ├── inventory/
    ├── warehouse/
    ├── maintenance/
    ├── warranty/
    ├── reports/
    ├── admin/
    ├── developer/
    ├── security/
    └── operations/
```

---

# 🔐 Git Safety

قبل تنفيذ أي Push:

```bash
git status
git add .
git commit -m "Update UI screens"
git push origin main
```

### ❌ ممنوع

```bash
git push --force
```

ولا تستخدم:

```text
ruun.py → Option 3 (Force Push)
```

إلا في حالة وجود سبب واضح وموافقة صريحة.

---

# 🇬🇧 English

## 📌 Project Status

**fronEndOman** is a frontend UI prototype repository for the **TechPro** platform.

The repository currently contains independent HTML screens that will later be converted into a production Laravel application using **Laravel Blade**.

### Current status

* 🎨 UI Prototype only
* 🌐 Multi-page Vanilla HTML
* 🎨 CSS
* ⚡ JavaScript
* 🚧 Not a Laravel application
* 🔄 Planned migration to Laravel + Blade
* 📱 Screens represent the required system interfaces

---

## 📊 Page Count

The repository currently contains:

* **45 identified pages** from `code_1.html` to `code_45.html`
* **1 unidentified HTML file:** `code.html`
* **46 HTML files in total**

`code.html` will remain under:

```text
pages/unknown/
```

until its purpose is identified.

---

## 📂 Identified Pages

|  # | File                                    | Page                                   |
| -: | --------------------------------------- | -------------------------------------- |
|  1 | `order-fulfillment.html`                | Order Fulfillment                      |
|  2 | `supplier-procurement-management.html`  | Supplier & Procurement Management      |
|  3 | `maintenance-warranty-management.html`  | Maintenance & Warranty Management      |
|  4 | `register.html`                         | Registration                           |
|  5 | `about.html`                            | About Us                               |
|  6 | `login.html`                            | Login                                  |
|  7 | `api-gateway-management.html`           | API Gateway Management                 |
|  8 | `customer-profile.html`                 | Customer Profile                       |
|  9 | `backup-disaster-recovery.html`         | Backup & Disaster Recovery             |
| 10 | `ai-recommendation-models.html`         | AI Recommendation Models               |
| 11 | `deployment-devops-center.html`         | Deployment & DevOps Center             |
| 12 | `inventory-management.html`             | Inventory Management                   |
| 13 | `distributed-tracing-performance.html`  | Distributed Tracing & Performance      |
| 14 | `developer-portal.html`                 | Developer Portal                       |
| 15 | `help-center.html`                      | Help Center                            |
| 16 | `device-comparison.html`                | Device Comparison                      |
| 17 | `warehouse-logistics-management.html`   | Warehouse & Logistics Management       |
| 18 | `security-audit-log.html`               | Security Audit Log                     |
| 19 | `financial-reports-accounting.html`     | Financial Reports & Accounting         |
| 20 | `customer-relationship-management.html` | Customer Relationship Management       |
| 21 | `help-center-2.html`                    | Help Center - Additional Screen        |
| 22 | `system-monitoring.html`                | System Monitoring                      |
| 23 | `membership-levels.html`                | Membership Levels                      |
| 24 | `security-audit-log-2.html`             | Security Audit Log - Additional Screen |
| 25 | `log-management.html`                   | Log Management                         |
| 26 | `cdn-edge-management.html`              | CDN & Edge Management                  |
| 27 | `order-confirmation.html`               | Order Confirmation                     |
| 28 | `event-stream-management.html`          | Event Stream Management                |
| 29 | `api-partner-management.html`           | API Partner Management                 |
| 30 | `employee-roles-permissions.html`       | Employee Roles & Permissions           |
| 31 | `account-order-summary.html`            | Account & Order Summary                |
| 32 | `configuration-secrets-management.html` | Configuration & Secrets Management     |
| 33 | `index.html`                            | Home                                   |
| 34 | `promotions-coupons-management.html`    | Promotions & Coupons Management        |
| 35 | `permissions-access-matrix.html`        | Permissions & Access Matrix            |
| 36 | `iphone-15-pro-max.html`                | iPhone 15 Pro Max                      |
| 37 | `shipping-payment-completion.html`      | Shipping & Payment Completion          |
| 38 | `device-catalog.html`                   | Device Catalog                         |
| 39 | `warranty-replacement-policy.html`      | Warranty & Replacement Policy          |
| 40 | `data-analytics-management.html`        | Data Analytics Management              |
| 41 | `central-lab-inspection.html`           | Central Lab Inspection                 |
| 42 | `security-operations-center-soc.html`   | Security Operations Center (SOC)       |
| 43 | `trade-in.html`                         | Trade-In                               |
| 44 | `incident-management.html`              | Incident Management                    |
| 45 | `product-details.html`                  | Product Details                        |

---

## 🛠️ Next Development Phase

The next phase is to migrate the existing HTML prototype into a structured Laravel application.

```text
HTML
 ↓
Blade
 ↓
Routes
 ↓
Controllers
 ↓
Models
 ↓
Database
 ↓
Authentication
 ↓
API / Backend
```

The current UI structure should be preserved as much as possible during the migration.

---

## 🔐 Git Safety

Before pushing changes:

```bash
git status
git add .
git commit -m "Update UI screens"
git push origin main
```

**Do not use Force Push.**

```bash
git push --force
```

Also do not use:

```text
ruun.py → Option 3 (Force Push)
```

unless explicitly approved.
