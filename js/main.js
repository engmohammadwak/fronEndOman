// js/main.js - كود الصفحة الرئيسية

/**
 * تهيئة الحركات والتأثيرات عند تحميل الصفحة
 */
function initializeAnimations() {
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 200);
  });
}

/**
 * تشغيل عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Home page loaded successfully');
  initializeAnimations();
});
