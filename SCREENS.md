💬 بروتوكول الطلب القادم (Prompt Protocol)
في المرات القادمة، يكفي أن ترسل الكود مباشرة مع العبارة التالية:

"فكك هذا الكود ووزعه طبقاً لملف WORKFLOW_GUIDE.md"

وسيقوم المساعد فوراً بالآتي:

إعطاؤك مسار واسم ملف الـ HTML النظيف داخل المجلد المناسب.

استخراج كود الـ CSS إن وُجد، وتحديد الملف المناسب لوضعه فيه.

استخراج كود الـ JS الخاص بالصفحة ووضعه في js/pages/[اسم-الملف].js.

التحقق من سلامة المسارات النسبية للصور والملفات.

///////////////////////////////////////////////////////

"فكك هذا الكود ووزعه طبقاً لملف WORKFLOW_GUIDE.md"


"Please refactor and break down this code according to the WORKFLOW_GUIDE.md specifications. Separate the HTML, extract page-specific JS/CSS into their designated folders, and ensure all relative paths match the project structure."

"Refactor and split this code strictly following WORKFLOW_GUIDE.md."

///////////////////////////////////////////////////////


انسخ الكود أعلاه وضعه في ملف باسم **`WORKFLOW_GUIDE.md`** في جذر مشروعك، وكلما أردت تفكيك صفحة جديدة فقط الصق الكود واطلب التفكيك بناءً على هذا الملف وسننجز الصفحات الـ 45 واحدة تلو الأخرى بنفس المعيار.






"Read the source file at All/about.html, refactor and split it strictly following WORKFLOW_GUIDE.md. Extract the clean HTML into its designated path under pages/, separate any inline CSS into css/, and move any script logic into js/pages/. Make sure all relative asset paths are corrected based on the new file depth."


"Refactor All/[file_name].html according to WORKFLOW_GUIDE.md and generate the separated files in the main structure."



Read the source file at "All/{file_name}.html". Refactor and split it strictly following WORKFLOW_GUIDE.md:
1. Identify the designated subfolder under "pages/" according to the project specification and place the cleaned HTML there.
2. Extract any inline CSS into the proper file inside "css/".
3. Move page-specific scripts into "js/pages/{FILE_NAME}.js".
4. Update and fix all relative paths (CSS, JS, assets/images) to match the new folder depth (e.g., use "../../" where appropriate).



أمثلة سريعة للاستخدام:
لصفحة تسجيل الدخول:

Read the source file at "All/login.html". Refactor and split it strictly following WORKFLOW_GUIDE.md...

لصفحة تفاصيل المنتج:

Read the source file at "All/product-details.html". Refactor and split it strictly following WORKFLOW_GUIDE.md...

لصفحة من نحن:

Read the source file at "All/about.html". Refactor and split it strictly following WORKFLOW_GUIDE.md...



# 🤖 دليل تشغيل الذكاء الاصطناعي لإعادة هيكلة الملفات (AI Automation Guide)

يوضح هذا الدليل كيفية توجيه أدوات البرمجة الذكية (مثل Cursor، Windsurf، Copilot) لقراءة الملفات المجمعة من مجلد `All/` وتفكيكها تلقائياً داخل الهيكل الرئيسي للمشروع طبقاً لمعايير `WORKFLOW_GUIDE.md`.

---

## 📋 المتطلبات الأساسية قبل البدء
* وجود مجلد `All/` في جذر المشروع محتوياً على ملفات الـ HTML الأصلية (`login.html`, `about.html`, إلخ).
* وجود ملف `WORKFLOW_GUIDE.md` في المجلد الرئيسي.
* استخدام محرر يدعم فهم ملفات المستودع (Workspace-aware AI).

---

## 🎯 بروتوكول الأمر الرئيسي (Standard Master Prompt)

انسخ النص التالي وضعه في صندوق محادثة الأداة الذكية مع استبدال اسم الملف فقط:

```text
Read the source file at "All/{FILE_NAME}.html". Refactor and split it strictly following WORKFLOW_GUIDE.md:
1. Identify the designated subfolder under "pages/" according to the project specification and place the cleaned HTML there.
2. Extract any inline CSS into the proper file inside "css/".
3. Move page-specific scripts into "js/pages/{FILE_NAME}.js".
4. Update and fix all relative paths (CSS, JS, assets/images) to match the new folder depth (e.g., use "../../" where appropriate).