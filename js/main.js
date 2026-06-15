/* ===================================================
   さくらメディカル整骨院 杉田院 - Main JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Elements ---
  const header = document.getElementById('header');
  let burger = document.getElementById('burger');
  let mobileMenu = document.getElementById('mobileMenu');
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

  function injectNavigationStyles() {
    if (document.getElementById('serviceNavigationStyles')) return;

    const style = document.createElement('style');

    style.id = 'serviceNavigationStyles';
    style.textContent = `
      @media (min-width:1180px) {
        .header__inner { max-width:1440px; padding-left:20px; padding-right:20px; gap:16px; }
        .header__nav { flex:1 1 auto; min-width:0; }
        .header__nav-list { justify-content:flex-end; flex-wrap:nowrap; gap:2px; }
        .header__nav-link { white-space:nowrap; padding:8px 9px; font-size:13px; line-height:1.25; }
        .header__actions { flex:0 0 auto; gap:10px; }
      }
      @media (max-width:1179px) {
        .header__nav, .header__tel { display:none !important; }
        .header__burger { display:flex !important; }
      }
      .mobile-menu__accordion { border-bottom:1px solid var(--color-border-light); }
      .mobile-menu__accordion-toggle { width:100%; border:0; background:transparent; font-family:inherit; cursor:pointer; justify-content:space-between; }
      .mobile-menu__accordion-toggle span { display:inline-flex; align-items:center; }
      .mobile-menu__accordion-icon { margin-right:0; font-size:.78rem; color:var(--color-text-muted); transition:transform .2s ease; }
      .mobile-menu__accordion.is-open .mobile-menu__accordion-icon { transform:rotate(180deg); }
      .mobile-menu__submenu { padding:0 0 10px; background:#fffafa; }
      .mobile-menu__sublink { display:flex; align-items:center; gap:10px; padding:10px 20px 10px 46px; color:var(--color-text); font-size:.88rem; text-decoration:none; }
      .mobile-menu__sublink i { width:14px; color:var(--color-primary); font-size:.7rem; }
      .mobile-menu__sublink--overview { font-weight:700; }
      .mobile-menu__section { margin:0; padding:16px 20px 6px; color:#e85b81; font-size:.78rem; font-weight:700; letter-spacing:.08em; }
    `;
    document.head.appendChild(style);
  }

  function injectColumnStyles() {
    if (!document.querySelector('.note-column-hero, .note-column-list, .note-summary') || document.getElementById('columnReadabilityStyles')) return;

    const style = document.createElement('style');

    style.id = 'columnReadabilityStyles';
    style.textContent = `
      body:has(.note-column-hero) { background:#fffafa; }
      .note-column-hero { padding:clamp(3rem, 7vw, 5.5rem) 1rem 2rem !important; background:linear-gradient(180deg,#fff6f8 0%,#fff 100%) !important; }
      .note-column-hero h1,
      .note-column-hero > p[style] { max-width:960px; margin:.25rem auto .75rem !important; font-size:clamp(1.7rem, 3.5vw, 2.45rem) !important; line-height:1.35 !important; letter-spacing:0 !important; }
      .note-column-hero > p:first-child:not([style]) { color:#e85b81 !important; font-size:.78rem !important; font-weight:700 !important; letter-spacing:.16em !important; text-transform:uppercase; margin:0 auto .5rem !important; }
      .note-column-hero > p:last-child:not([style]) { max-width:720px !important; font-size:.98rem !important; line-height:1.8 !important; }
      .note-column-list { max-width:1080px; margin:0 auto; display:grid !important; grid-template-columns:1fr !important; gap:1rem !important; }
      .note-column-card { display:grid !important; grid-template-columns:260px minmax(0,1fr) !important; border-radius:8px !important; box-shadow:0 4px 18px rgba(30,15,20,.06) !important; }
      .note-column-card img { height:100% !important; min-height:176px !important; aspect-ratio:auto !important; object-fit:cover !important; }
      .note-column-card__body { padding:1.15rem 1.25rem !important; gap:.45rem !important; min-width:0; }
      .note-column-card time,
      .note-summary__date { color:#9b7c86 !important; font-size:.82rem !important; font-weight:700 !important; }
      .note-column-card h2 { font-size:1rem !important; line-height:1.55 !important; }
      .note-column-card p { font-size:.88rem !important; line-height:1.75 !important; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
      .note-column-card a { display:inline-flex; align-items:center; align-self:flex-start; margin-top:.25rem !important; padding:.55rem .9rem; border-radius:999px; background:#fce4ec; color:#c4385e !important; font-size:.86rem; text-decoration:none; }
      .note-summary { max-width:860px !important; background:#fff; border:1px solid #f0e0e3; border-radius:8px; padding:clamp(1rem, 3vw, 2rem) !important; box-shadow:0 4px 20px rgba(30,15,20,.05); }
      .note-summary__image { border-radius:8px !important; margin-bottom:1rem !important; }
      .note-summary h1 { font-size:clamp(1.45rem, 3vw, 2rem) !important; line-height:1.55 !important; margin:.6rem 0 1rem !important; overflow-wrap:anywhere; }
      .note-summary__box { padding:1.1rem 1.25rem !important; margin:1.25rem 0 !important; border-radius:0 8px 8px 0 !important; }
      .note-summary p { font-size:.98rem; line-height:1.9; }
      .note-summary .btn { white-space:normal; text-align:center; justify-content:center; }
      @media (max-width:720px) {
        body:has(.note-column-hero) .header__logo-main { font-size:15px; }
        .note-column-hero { padding:2.25rem 1rem 1.25rem !important; text-align:left !important; }
        .note-column-hero h1,
        .note-column-hero > p[style] { font-size:1.55rem !important; line-height:1.45 !important; }
        .note-column-hero > p:last-child:not([style]) { font-size:.9rem !important; }
        body:has(.note-column-hero) .section { padding:28px 0 !important; }
        .note-column-list { gap:.85rem !important; }
        .note-column-card { grid-template-columns:112px minmax(0,1fr) !important; min-height:136px; }
        .note-column-card img { min-height:136px !important; height:100% !important; }
        .note-column-card__body { padding:.85rem !important; gap:.35rem !important; }
        .note-column-card h2 { font-size:.92rem !important; line-height:1.5 !important; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
        .note-column-card p { display:none !important; }
        .note-column-card a { padding:.4rem .7rem; font-size:.8rem; }
        .note-summary { padding:1rem !important; border-left:0; border-right:0; border-radius:0; box-shadow:none; }
        .note-summary h1 { font-size:1.35rem !important; line-height:1.55 !important; }
        .note-summary__box { padding:1rem !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureMobileNavigation() {
    if (!header) return;

    const navLinks = Array.from(document.querySelectorAll('.header__nav-list > li > a'));
    let actions = header.querySelector('.header__actions');

    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'header__actions';
      header.querySelector('.header__inner')?.appendChild(actions);
    }

    if (!burger) {
      burger = document.createElement('button');
      burger.className = 'header__burger';
      burger.id = 'burger';
      burger.type = 'button';
      burger.setAttribute('aria-label', 'メニューを開く');
      burger.setAttribute('aria-expanded', 'false');
      burger.innerHTML = '<span></span><span></span><span></span>';
      actions.appendChild(burger);
    }

    if (!mobileMenu && navLinks.length) {
      mobileMenu = document.createElement('div');
      mobileMenu.className = 'mobile-menu';
      mobileMenu.id = 'mobileMenu';
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.innerHTML = [
        '<nav><ul class="mobile-menu__list">',
        navLinks.map((link) => {
          const href = link.getAttribute('href');
          const text = link.textContent.trim().replace(/\s+/g, '');
          return `<li><a href="${href}" class="mobile-menu__link">${text}</a></li>`;
        }).join(''),
        '</ul><a href="tel:045-353-8852" class="mobile-menu__tel"><i class="fas fa-phone-alt"></i> 045-353-8852</a></nav>'
      ].join('');
      header.insertAdjacentElement('afterend', mobileMenu);
    }
  }

  function reorderTopHero() {
    const hero = document.getElementById('hero');
    const imageBlock = hero?.querySelector('img[src$="top-main.png"]')?.closest('div');

    if (hero && imageBlock && hero.firstElementChild !== imageBlock) {
      hero.insertBefore(imageBlock, hero.firstElementChild);
    }
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

  injectNavigationStyles();
  injectColumnStyles();
  ensureMobileNavigation();
  reorderTopHero();
  moveColumnNavToEnd();
  setupServiceNavigation();

  // ===================================================
  // HEADER SCROLL EFFECT
  // ===================================================
  let lastScroll = 0;

  function handleScroll() {
    const scrollY = window.scrollY;

    // Header background
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Back to top button
    if (backToTop) {
      if (scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
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
    if (!burger || !mobileMenu) return;

    const isOpen = mobileMenu.classList.toggle('active');
    burger.classList.toggle('active');
    burger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  }

  function closeMobileMenu() {
    if (!burger || !mobileMenu) return;

    mobileMenu.classList.remove('active');
    burger.classList.remove('active');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }

  burger?.addEventListener('click', toggleMobileMenu);

  mobileMenu?.querySelectorAll('.mobile-menu__accordion-toggle').forEach(button => {
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
  mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close mobile menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
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

      const headerHeight = header?.offsetHeight || 0;
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
  backToTop?.addEventListener('click', () => {
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
