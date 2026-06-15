/* ===================================================
   さくらメディカル整骨院 杉田院 - Main JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Elements ---
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const backToTop = document.getElementById('backToTop');
  const fixedCta = document.getElementById('fixedCta');
  const heroSection = document.getElementById('hero');

  // ===================================================
  // GLOBAL NAV SERVICE FINDER
  // ===================================================
  const symptomLinks = [
    ['腰痛・ぎっくり腰', '/lumbar-pain/'],
    ['肩こり・四十肩', '/shoulder-pain/'],
    ['膝の痛み', '/knee-pain/'],
    ['腱鞘炎・手首の痛み', '/tendinitis/'],
    ['足首の痛み・捻挫', '/ankle-pain/'],
    ['突き指・指の痛み', '/finger-injury/'],
    ['首痛・寝違え', '/neck-pain/']
  ];

  const methodLinks = [
    ['外傷のケア', '/trauma-care/'],
    ['交通事故治療', '/accident/'],
    ['鍼灸施術', '/acupuncture/'],
    ['骨盤矯正', '/pelvic-correction/'],
    ['スポーツ障害', '/sports-injury/'],
    ['リハビリ・後療法', '/rehabilitation/'],
    ['手技療法', '/services/#manual-therapy'],
    ['電気治療器', '/services/#electrotherapy'],
    ['腰椎牽引療法', '/services/#lumbar-traction'],
    ['アクアタイザー', '/services/#aquatizer']
  ];

  function buildDropdownColumn(title, links) {
    return [
      '<li class="header__dropdown-col">',
      `<span class="header__dropdown-title">${title}</span>`,
      '<ul class="header__dropdown-list">',
      links.map(([label, href]) => `<li><a href="${href}" class="header__dropdown-link">${label}</a></li>`).join(''),
      '</ul>',
      '</li>'
    ].join('');
  }

  function buildMobileAccordion() {
    const item = document.createElement('li');
    const panelId = 'mobileServiceMenuPanel';

    item.className = 'mobile-menu__accordion';
    item.innerHTML = [
      `<button type="button" class="mobile-menu__link mobile-menu__accordion-toggle" aria-expanded="false" aria-controls="${panelId}">`,
      '<span><i class="fas fa-notes-medical"></i>施術メニュー</span>',
      '<i class="fas fa-chevron-down mobile-menu__accordion-icon" aria-hidden="true"></i>',
      '</button>',
      `<div class="mobile-menu__submenu" id="${panelId}" hidden>`,
      '<a href="/services/" class="mobile-menu__sublink mobile-menu__sublink--overview"><i class="fas fa-list"></i>施術メニュー一覧</a>',
      '<p class="mobile-menu__section">症状から探す</p>',
      symptomLinks.map(([label, href]) => `<a href="${href}" class="mobile-menu__sublink"><i class="fas fa-chevron-right"></i>${label}</a>`).join(''),
      '<p class="mobile-menu__section">治療方法から探す</p>',
      methodLinks.map(([label, href]) => `<a href="${href}" class="mobile-menu__sublink"><i class="fas fa-chevron-right"></i>${label}</a>`).join(''),
      '</div>'
    ].join('');

    return item;
  }

  function moveColumnNavToEnd() {
    document.querySelectorAll('.header__nav-list').forEach((navList) => {
      const columnItem = navList.querySelector('a[href="/column/"]')?.closest('li');

      if (columnItem) {
        navList.appendChild(columnItem);
      }
    });
  }

  function setupServiceNavigation() {
    const dropdown = document.querySelector('.header__dropdown');

    if (dropdown) {
      dropdown.classList.add('header__dropdown--mega');
      dropdown.innerHTML = [
        buildDropdownColumn('症状から探す', symptomLinks),
        buildDropdownColumn('治療方法から探す', methodLinks)
      ].join('');
    }

    const mobileList = document.querySelector('.mobile-menu__list');
    const servicesLinkItem = mobileList?.querySelector('a[href="/services/"], .mobile-menu__accordion-toggle')?.closest('li');

    if (mobileList && servicesLinkItem) {
      let node = servicesLinkItem.nextElementSibling;

      while (node) {
        const link = node.querySelector?.('a.mobile-menu__link');
        const isGeneratedSection = node.classList?.contains('mobile-menu__section');
        const isGeneratedLink = link?.hasAttribute('style') || link?.querySelector('.fa-chevron-right');

        if (!isGeneratedSection && !isGeneratedLink) {
          break;
        }

        const next = node.nextElementSibling;
        node.remove();
        node = next;
      }

      servicesLinkItem.replaceWith(buildMobileAccordion());
    }
  }

  moveColumnNavToEnd();
  setupServiceNavigation();

  // ===================================================
  // HEADER SCROLL EFFECT
  // ===================================================
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;

    // Header background
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Back to top button
    if (scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Fixed CTA (mobile)
    if (fixedCta) {
      if (scrollY > 400) {
        fixedCta.classList.add('visible');
      } else {
        fixedCta.classList.remove('visible');
      }
    }

    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // ===================================================
  // MOBILE MENU
  // ===================================================
  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.toggle('active');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  burger.addEventListener('click', toggleMobileMenu);

  mobileMenu.querySelectorAll('.mobile-menu__accordion-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      const panel = document.getElementById(button.getAttribute('aria-controls'));

      button.setAttribute('aria-expanded', String(!isOpen));
      button.closest('.mobile-menu__accordion')?.classList.toggle('is-open', !isOpen);

      if (panel) {
        panel.hidden = isOpen;
      }
    });
  });

  // Close mobile menu on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // ===================================================
  // SMOOTH SCROLL
  // ===================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerHeight = header.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });

  // ===================================================
  // BACK TO TOP
  // ===================================================
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===================================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // ===================================================
  const animateElements = document.querySelectorAll('[data-animate]');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animateElements.forEach((el, index) => {
      // Stagger delay for grid items
      const parent = el.closest('.features__grid, .services__grid');
      if (parent) {
        const siblings = parent.querySelectorAll('[data-animate]');
        const siblingIndex = Array.from(siblings).indexOf(el);
        el.style.transitionDelay = `${siblingIndex * 0.1}s`;
      }
      observer.observe(el);
    });
  } else {
    // Fallback for older browsers
    animateElements.forEach(el => el.classList.add('animated'));
  }

  // ===================================================
  // COUNT-UP ANIMATION
  // ===================================================
  const countElements = document.querySelectorAll('[data-count]');

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000;
    const startTime = performance.now();

    function formatNumber(num) {
      if (num >= 10000) {
        return (num / 10000).toFixed(0) + '万';
      }
      return num.toLocaleString();
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      el.textContent = formatNumber(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    countElements.forEach(el => countObserver.observe(el));
  } else {
    countElements.forEach(el => {
      el.textContent = parseInt(el.getAttribute('data-count'), 10).toLocaleString();
    });
  }

  // ===================================================
  // SAKURA PETALS ANIMATION
  // ===================================================
  const petalsContainer = document.querySelector('.hero__petals');
  
  if (petalsContainer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const petalCount = 15;

    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('div');
      petal.classList.add('petal');
      
      const size = Math.random() * 12 + 8;
      const left = Math.random() * 100;
      const delay = Math.random() * 10;
      const duration = Math.random() * 8 + 8;
      const opacity = Math.random() * 0.3 + 0.2;

      petal.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        opacity: ${opacity};
      `;

      petalsContainer.appendChild(petal);
    }
  }

  // ===================================================
  // ACTIVE NAV LINK (Scroll Spy)
  // ===================================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link');

  function updateActiveNav() {
    const scrollY = window.scrollY;
    const headerHeight = header.offsetHeight;

    sections.forEach(section => {
      const top = section.offsetTop - headerHeight - 100;
      const bottom = top + section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ===================================================
  // FAQ SMOOTH OPEN/CLOSE
  // ===================================================
  document.querySelectorAll('.faq__item').forEach(item => {
    item.addEventListener('toggle', function () {
      if (this.open) {
        const answer = this.querySelector('.faq__answer');
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.3s ease';
        requestAnimationFrame(() => {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        });
      }
    });
  });

  // ===================================================
  // PERFORMANCE: Lazy load iframe
  // ===================================================
  const mapIframe = document.querySelector('.access__map iframe');
  if (mapIframe && 'IntersectionObserver' in window) {
    const src = mapIframe.getAttribute('src');
    mapIframe.setAttribute('data-src', src);
    mapIframe.removeAttribute('src');

    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          iframe.setAttribute('src', iframe.getAttribute('data-src'));
          lazyObserver.unobserve(iframe);
        }
      });
    }, { rootMargin: '200px 0px' });

    lazyObserver.observe(mapIframe);
  }

  // ===================================================
  // LIGHTBOX (Gallery)
  // ===================================================
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const galleryItems = document.querySelectorAll('.gallery__item');
  let currentLightboxIndex = 0;

  if (lightbox && galleryItems.length) {
    const galleryData = Array.from(galleryItems).map(item => ({
      src: item.querySelector('img').src,
      alt: item.querySelector('img').alt,
      caption: item.querySelector('.gallery__caption')?.textContent || ''
    }));

    function openLightbox(index) {
      currentLightboxIndex = index;
      lightboxImg.src = galleryData[index].src;
      lightboxImg.alt = galleryData[index].alt;
      lightboxCaption.textContent = galleryData[index].caption;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    }

    function nextImage() {
      currentLightboxIndex = (currentLightboxIndex + 1) % galleryData.length;
      lightboxImg.src = galleryData[currentLightboxIndex].src;
      lightboxImg.alt = galleryData[currentLightboxIndex].alt;
      lightboxCaption.textContent = galleryData[currentLightboxIndex].caption;
    }

    function prevImage() {
      currentLightboxIndex = (currentLightboxIndex - 1 + galleryData.length) % galleryData.length;
      lightboxImg.src = galleryData[currentLightboxIndex].src;
      lightboxImg.alt = galleryData[currentLightboxIndex].alt;
      lightboxCaption.textContent = galleryData[currentLightboxIndex].caption;
    }

    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => openLightbox(index));
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__next').addEventListener('click', nextImage);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', prevImage);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });
  }

  // ===================================================
  // GA4 PHONE CLICK TRACKING
  // ===================================================
  document.querySelectorAll('a[href^="tel:"]').forEach(function(el) {
    el.addEventListener('click', function() {
      if (typeof gtag === 'function') {
        gtag('event', 'phone_click', {
          'phone_number': this.href.replace('tel:', '')
        });
      }
    });
  });

  // ===================================================
  // FOOTER FINDER LINKS
  // ===================================================
  const footerNav = document.querySelector('.footer__nav');

  if (footerNav) {
    const guideColumn = Array.from(footerNav.querySelectorAll('.footer__nav-col')).find((column) => {
      return column.querySelector('.footer__nav-title')?.textContent.trim() === 'ご案内';
    });
    const symptomTitle = Array.from(footerNav.querySelectorAll('.footer__nav-title')).find((title) => {
      return title.textContent.trim() === '症状・治療';
    });

    if (symptomTitle) {
      symptomTitle.textContent = '症状から探す';
    }

    if (!footerNav.querySelector('a[href="/neck-pain/"]')) {
      const symptomColumn = document.createElement('div');

      symptomColumn.className = 'footer__nav-col';
      symptomColumn.innerHTML = [
        '<h3 class="footer__nav-title">症状から探す</h3>',
        '<ul>',
        '<li><a href="/lumbar-pain/">腰痛・ぎっくり腰</a></li>',
        '<li><a href="/shoulder-pain/">肩こり・四十肩</a></li>',
        '<li><a href="/knee-pain/">膝の痛み</a></li>',
        '<li><a href="/tendinitis/">腱鞘炎・手首の痛み</a></li>',
        '<li><a href="/ankle-pain/">足首の痛み・捻挫</a></li>',
        '<li><a href="/finger-injury/">突き指・指の痛み</a></li>',
        '<li><a href="/neck-pain/">首痛・寝違え</a></li>',
        '</ul>'
      ].join('');

      footerNav.insertBefore(symptomColumn, guideColumn || null);
    }

    if (!footerNav.querySelector('a[href="/trauma-care/"]')) {
      const methodColumn = document.createElement('div');

      methodColumn.className = 'footer__nav-col';
      methodColumn.innerHTML = [
        '<h3 class="footer__nav-title">治療方法から探す</h3>',
        '<ul>',
        methodLinks.map(([label, href]) => `<li><a href="${href}">${label}</a></li>`).join(''),
        '</ul>'
      ].join('');

      footerNav.insertBefore(methodColumn, guideColumn || null);
    } else {
      const methodColumn = Array.from(footerNav.querySelectorAll('.footer__nav-col')).find((column) => {
        return column.querySelector('.footer__nav-title')?.textContent.trim() === '治療方法から探す';
      });
      const methodList = methodColumn?.querySelector('ul');

      if (methodList) {
        methodLinks.forEach(([label, href]) => {
          if (!methodList.querySelector(`a[href="${href}"]`)) {
            const item = document.createElement('li');

            item.innerHTML = `<a href="${href}">${label}</a>`;
            methodList.appendChild(item);
          }
        });
      }
    }
  }

  // ===================================================
  // CONSOLE LOG (Dev)
  // ===================================================
  console.log('%c🌸 杉田さくら鍼灸治療院', 'color: #e85b81; font-size: 16px; font-weight: bold;');
  console.log('%cWebsite loaded successfully.', 'color: #7a6b70;');
});
