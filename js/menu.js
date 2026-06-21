// menu.js - Mobile burger menu

// iOS / mobile scroll lock — no layout shift
function lockScroll() {
  document.documentElement.style.overflow = 'hidden';
}

function unlockScroll() {
  document.documentElement.style.overflow = '';
}

export function initMenu() {
  const burger = document.querySelector('.header__burger');
  const mobileMenu = document.querySelector('.header__mobile-menu');
  if (!burger || !mobileMenu) return;

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.contains('is-open');
    burger.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open');
    isOpen ? unlockScroll() : lockScroll();
  });

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      burger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      unlockScroll();
    });
  });
}
