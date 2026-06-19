(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupImageFallbacks();
    setupFilters();
  });

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var previous = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    if (slides.length === 0) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img[data-fallback-image]'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
        if (image.parentElement) {
          image.parentElement.classList.add('image-fallback');
        }
      });
    });
  }

  function setupFilters() {
    var input = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var categorySelect = document.querySelector('[data-category-filter]');
    var count = document.querySelector('[data-visible-count]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var noResults = document.querySelector('[data-no-results]');

    if (cards.length === 0 || (!input && !yearSelect && !typeSelect && !categorySelect)) {
      return;
    }

    hydrateSelect(yearSelect, unique(cards.map(function (card) {
      return card.getAttribute('data-year') || '';
    })).sort(function (a, b) {
      return parseInt(b, 10) - parseInt(a, 10);
    }));

    hydrateSelect(typeSelect, unique(cards.map(function (card) {
      return card.getAttribute('data-type') || '';
    })).sort());

    function apply() {
      var query = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var category = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || card.getAttribute('data-year') === year;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var matchesCategory = !category || card.getAttribute('data-category') === category;
        var matches = matchesQuery && matchesYear && matchesType && matchesCategory;

        card.classList.toggle('hidden-card', !matches);
        if (matches) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (noResults) {
        noResults.classList.toggle('show', visible === 0);
      }
    }

    [input, yearSelect, typeSelect, categorySelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    apply();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function unique(values) {
    var seen = {};
    return values.filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    });
  }
})();
