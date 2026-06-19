(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var next = carousel.querySelector('[data-hero-next]');
    var prev = carousel.querySelector('[data-hero-prev]');
    var dotsWrap = carousel.querySelector('[data-hero-dots]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var dots = [];

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    if (dotsWrap) {
      slides.forEach(function (_, dotIndex) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换推荐影片');
        dot.addEventListener('click', function () {
          show(dotIndex);
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function textOf(item) {
    return [
      item.dataset.title || '',
      item.dataset.type || '',
      item.dataset.year || '',
      item.dataset.genre || '',
      item.dataset.category || '',
      item.dataset.tags || ''
    ].join(' ').toLowerCase();
  }

  function setupPageFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var input = panel.querySelector('[data-filter-input]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var list = document.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      var items = Array.prototype.slice.call(list.querySelectorAll('.filter-item'));

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        items.forEach(function (item) {
          var matched = true;
          if (keyword && textOf(item).indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && (item.dataset.type || '') !== typeValue) {
            matched = false;
          }
          if (yearValue && (item.dataset.year || '') !== yearValue) {
            matched = false;
          }
          item.classList.toggle('is-hidden', !matched);
        });
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || typeof MOVIE_SEARCH_INDEX === 'undefined') {
      return;
    }
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var type = document.querySelector('[data-search-type]');
    var year = document.querySelector('[data-search-year]');
    var category = document.querySelector('[data-search-category]');
    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function card(movie) {
      var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).join(' ') : '';
      return '<a class="movie-card filter-item" href="' + movie.url + '" data-title="' + escapeHtml(movie.title) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '" data-category="' + escapeHtml(movie.category) + '" data-tags="' + escapeHtml(tags) + '">' +
        '<figure class="poster-frame"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-cover><span class="poster-badge">' + escapeHtml(movie.type || movie.category) + '</span><span class="poster-score">' + movie.rating + '</span></figure>' +
        '<div class="movie-card-body"><h3>' + escapeHtml(movie.title) + '</h3><p>' + escapeHtml(limit(movie.oneLine, 72)) + '</p><div class="movie-meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div></div>' +
        '</a>';
    }

    function limit(value, length) {
      value = value || '';
      if (value.length <= length) {
        return value;
      }
      return value.slice(0, length) + '…';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[character];
      });
    }

    function applySearch(event) {
      if (event) {
        event.preventDefault();
      }
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var categoryValue = category ? category.value : '';
      var matched = MOVIE_SEARCH_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.type, movie.year, movie.region, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        if (keyword && haystack.indexOf(keyword) === -1) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        if (yearValue && movie.year !== yearValue) {
          return false;
        }
        if (categoryValue && movie.category !== categoryValue) {
          return false;
        }
        return true;
      }).slice(0, 120);
      results.innerHTML = matched.map(card).join('');
      setupImageFade(results);
      if (window.history && input) {
        var nextParams = new URLSearchParams(window.location.search);
        if (input.value.trim()) {
          nextParams.set('q', input.value.trim());
        } else {
          nextParams.delete('q');
        }
        var query = nextParams.toString();
        window.history.replaceState(null, '', query ? 'search.html?' + query : 'search.html');
      }
    }

    if (form) {
      form.addEventListener('submit', applySearch);
    }
    [input, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });
    applySearch();
  }

  function setupImageFade(root) {
    var scope = root || document;
    scope.querySelectorAll('img[data-cover]').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupPageFilters();
    setupSearchPage();
    setupImageFade(document);
  });
})();
