(function () {
  'use strict';

  // ----- Gallery images: додайте URL фото для портфоліо -----
  const galleryImages = [
    // Приклад: '/images/portfolio-1.jpg', '/images/portfolio-2.jpg', ...
    'images/portfolio-1.jpg',
    'images/portfolio-2.jpg',
    'images/portfolio-4.jpg',    
    'images/portfolio-3.jpg',
    'images/portfolio-5.jpg',
    'images/portfolio-6.jpg',
  ];

  // ----- Price images: прайси салону -----
  const priceImages = [
    { src: 'images/prices/price-hair-1.jpg', alt: 'Прайс-лист: волосся (топ-майстер)' },
    { src: 'images/prices/price-hair-2.jpg', alt: 'Прайс-лист: волосся (1)' },
    { src: 'images/prices/price-hair-2 (2).jpg', alt: 'Прайс-лист: волосся (2)' },
    { src: 'images/prices/price-brows-lashes.jpg', alt: 'Прайс-лист: брови / вії' },
    { src: 'images/prices/price-permanent.jpg', alt: 'Прайс-лист: перманентний макіяж' },
    { src: 'images/prices/price-manicure-1.jpg', alt: 'Прайс-лист: манікюр' },
    { src: 'images/prices/price-manicure-2.jpg', alt: 'Прайс-лист: манікюр (Аліна Дорошенко)' },
    { src: 'images/prices/price-massage.jpg', alt: 'Прайс-лист: масаж' },

  ];

  // ----- Scroll-triggered animations -----
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

  // ----- Header scroll state -----
  const header = document.querySelector('.header');
  if (header) {
    const handleScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ----- Floating booking button: hidden on hero & contact -----
  const floatingBooking = document.getElementById('floating-booking');
  const heroSection = document.querySelector('.hero');
  const contactSection = document.getElementById('contact');

  if (floatingBooking && (heroSection || contactSection)) {
    const visibility = { hero: false, contact: false };

    const updateFloatingBooking = () => {
      const shouldHide = visibility.hero || visibility.contact;
      floatingBooking.hidden = shouldHide;
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === heroSection) visibility.hero = entry.isIntersecting;
          if (entry.target === contactSection) visibility.contact = entry.isIntersecting;
        });
        updateFloatingBooking();
      },
      { threshold: 0.35 }
    );

    if (heroSection) io.observe(heroSection);
    if (contactSection) io.observe(contactSection);

    updateFloatingBooking();
  }

  // ----- Mobile menu -----
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // ----- Gallery: підстановка зображень та lightbox -----
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  let isPriceMode = false;
  let currentPriceIndex = 0;

  function updateLightboxNav() {
    if (!lightboxPrev || !lightboxNext) return;
    const show = isPriceMode && priceImages.length > 1;
    lightboxPrev.style.display = show ? 'flex' : 'none';
    lightboxNext.style.display = show ? 'flex' : 'none';
  }

  function openLightbox(src, alt, options = {}) {
    if (!lightbox || !lightboxImg) return;

    if (options.mode === 'price' && priceImages.length) {
      isPriceMode = true;
      currentPriceIndex = options.index ?? 0;
      const item = priceImages[currentPriceIndex] || priceImages[0];
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
    } else {
      isPriceMode = false;
      lightboxImg.src = src;
      lightboxImg.alt = alt || 'Зображення галереї';
    }

    updateLightboxNav();
    lightbox.hidden = false;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightboxClose?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    isPriceMode = false;
    updateLightboxNav();
    lightbox.classList.remove('is-open');
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function showPrice(delta) {
    if (!isPriceMode || !priceImages.length || !lightboxImg) return;
    const total = priceImages.length;
    currentPriceIndex = (currentPriceIndex + delta + total) % total;
    const item = priceImages[currentPriceIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
  }

  galleryItems.forEach((item, i) => {
    const imgUrl = galleryImages[i];
    if (imgUrl) {
      item.innerHTML = '';
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = 'Робота студії ' + (i + 1);
      img.loading = 'lazy';
      item.appendChild(img);
    }

    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && img.src && !img.src.startsWith('data:')) {
        openLightbox(img.src, img.alt);
      }
    });
  });

  // ----- Price list viewer: єдина кнопка під послугами -----
  const pricesButton = document.querySelector('.btn-prices');
  if (pricesButton && priceImages.length) {
    pricesButton.addEventListener('click', () => {
      openLightbox(priceImages[0].src, priceImages[0].alt, {
        mode: 'price',
        index: 0
      });
    });
  }

  if (lightboxPrev && lightboxNext) {
    lightboxPrev.addEventListener('click', () => showPrice(-1));
    lightboxNext.addEventListener('click', () => showPrice(1));
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      } else if (isPriceMode && e.key === 'ArrowRight') {
        showPrice(1);
      } else if (isPriceMode && e.key === 'ArrowLeft') {
        showPrice(-1);
      }
    });
  }

  // ----- Google reviews (static placeholder; підключіть API пізніше) -----
  const googleReviewsData = [
    {
      author: 'Анна',
      rating: 5,
      text: 'Крім смачної кави, ви можете побувати у професійного жіночого майстра та крутого Барбера 🤘 кращі майстри з манікюру та ламінації вій, так само чекають на вас 😘❤️ А приємна атмосфера салону нікого не залишає байдужим, всі хочуть повертатися туди знову і знову.'
    },
    {
      author: 'Оксана',
      rating: 5,
      text: 'Атмосфера дуже класна.'
    },
    {
      author: 'Ірія',
      rating: 5,
      text: 'Без коментарів'
    }
  ];

  const googleReviewsContainer = document.getElementById('google-reviews');

  if (googleReviewsContainer && Array.isArray(googleReviewsData)) {
    googleReviewsData.forEach((review) => {
      const card = document.createElement('article');
      card.className = 'review-card';

      const ratingEl = document.createElement('div');
      ratingEl.className = 'review-rating';

      const stars = document.createElement('span');
      stars.textContent = '★★★★★'.slice(0, review.rating);
      ratingEl.appendChild(stars);

      const label = document.createElement('small');
      label.textContent = review.rating.toFixed(1) + ' / 5';
      ratingEl.appendChild(label);

      const textEl = document.createElement('p');
      textEl.className = 'review-text';
      textEl.textContent = review.text;

      const authorEl = document.createElement('footer');
      authorEl.className = 'review-author';
      authorEl.textContent = '— ' + review.author;

      card.appendChild(ratingEl);
      card.appendChild(textEl);
      card.appendChild(authorEl);

      googleReviewsContainer.appendChild(card);
    });
  }

  // ----- Custom Select Handling -----
  const customSelect = document.getElementById('custom-service-select');
  if (customSelect) {
    const trigger = customSelect.querySelector('.select-trigger');
    const optionsContainer = customSelect.querySelector('.select-options');
    const options = customSelect.querySelectorAll('.select-option');
    const nativeSelect = customSelect.querySelector('select');
    const valueDisplay = customSelect.querySelector('.select-value');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      customSelect.classList.toggle('active');
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        const value = option.getAttribute('data-value');
        const text = option.textContent.trim();

        // Update display
        valueDisplay.textContent = text;
        if (value === "") {
          valueDisplay.classList.add('is-placeholder');
        } else {
          valueDisplay.classList.remove('is-placeholder');
        }
        
        // Update native select
        nativeSelect.value = value;
        
        // Update active state in list
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        
        // Close dropdown
        customSelect.classList.remove('active');
        
        // Trigger change event on native select if needed
        nativeSelect.dispatchEvent(new Event('change'));
      });
    });

    // Close when clicking outside
    document.addEventListener('click', () => {
      customSelect.classList.remove('active');
    });
  }

  // ----- Contact form -----
  const form = document.getElementById('contact-form');
  const messageEl = document.getElementById('form-message');

  if (form && messageEl) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#name').value.trim();
      const phone = form.querySelector('#phone').value.trim();
      const service = form.querySelector('#service')?.value || '';
      const comment = form.querySelector('#comment')?.value.trim() || '';
      const contactMethod =
        form.querySelector('input[name="contactMethod"]:checked')?.value || 'phone';

      if (!name || !phone) {
        showMessage('Будь ласка, заповніть ім\'я та телефон.', 'error');
        return;
      }

      const payload = {
        name,
        phone,
        service,
        comment,
        contactMethod
      };

      // Тут у майбутньому можна відправити payload у Telegram-бот або backend
      console.log('Нова заявка на запис:', payload);

      const contactText =
        contactMethod === 'telegram'
          ? 'Ми напишемо вам у Telegram найближчим часом.'
          : 'Ми зателефонуємо вам у найближчий робочий час.';

      // Симуляція відправки. Підключіть Formspree, EmailJS, Telegram-бот або власний backend.
      showMessage('Дякуємо! ' + contactText, 'success');
      form.reset();
    });
  }

  function showMessage(text, type) {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = 'form-message visible ' + type;
    messageEl.setAttribute('aria-live', 'polite');

    setTimeout(() => {
      messageEl.classList.remove('visible');
    }, 6000);
  }

  // ----- Smooth scroll for anchor links -----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
