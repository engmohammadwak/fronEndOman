// ========================================
// Toast Notifications - Global Utility
// ========================================

// إنشاء حاوية الإشعارات (Toast Container)
function createToastContainer() {
  // التحقق إذا كانت الحاوية موجودة مسبقاً
  if (document.getElementById('toast-container')) {
    return;
  }
  
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-md px-4';
  document.body.appendChild(container);
}

// دالة عرض الإشعار
function showToast(message, type = 'success', duration = 3000) {
  // إنشاء الحاوية إذا لم تكن موجودة
  createToastContainer();
  
  const container = document.getElementById('toast-container');
  
  // ألوان وأنواع الإشعارات
  const toastTypes = {
    success: {
      bg: 'bg-tertiary',
      text: 'text-on-tertiary',
      border: 'border-tertiary-fixed',
      icon: 'check_circle'
    },
    error: {
      bg: 'bg-error',
      text: 'text-on-error',
      border: 'border-error-container',
      icon: 'error'
    },
    warning: {
      bg: 'bg-primary',
      text: 'text-on-primary',
      border: 'border-primary-container',
      icon: 'warning'
    },
    info: {
      bg: 'bg-surface-container-high',
      text: 'text-on-surface',
      border: 'border-outline-variant',
      icon: 'info'
    }
  };
  
  const toastConfig = toastTypes[type] || toastTypes.success;
  
  // إنشاء عنصر الإشعار
  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold transition-all duration-300 ${toastConfig.bg} ${toastConfig.text} ${toastConfig.border} translate-y-2 opacity-0`;
  
  toast.innerHTML = `
    <span class="material-symbols-outlined text-xl" aria-hidden="true">${toastConfig.icon}</span>
    <span class="flex-1">${message}</span>
  `;
  
  // إضافة الإشعار للحاوية
  container.appendChild(toast);
  
  // أنيميشن الظهور
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);
  
  // إزالة الإشعار بعد المدة المحددة
  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// إنشاء الحاوية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', createToastContainer);

// تصدير الدالة للاستخدام العالمي
window.showToast = showToast;
