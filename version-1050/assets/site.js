document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupHeaderSearch();
    setupPlayers();
});

function setupMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
        return;
    }
    button.addEventListener('click', function () {
        panel.classList.toggle('is-open');
    });
}

function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
        return;
    }

    var activeIndex = 0;
    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    showSlide(0);
    window.setInterval(function () {
        showSlide(activeIndex + 1);
    }, 5200);
}

function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    forms.forEach(function (form) {
        var scopeSelector = form.getAttribute('data-filter-form');
        var scope = document.querySelector(scopeSelector);
        if (!scope) {
            return;
        }

        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var input = form.querySelector('[name="keyword"]');
        var year = form.querySelector('[name="year"]');
        var sort = form.querySelector('[name="sort"]');
        var count = document.querySelector(form.getAttribute('data-count-target') || '');

        function applyFilters() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var visible = [];

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.year
                ].join(' ').toLowerCase();
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !yearValue || card.dataset.year === yearValue;
                var isVisible = matchKeyword && matchYear;
                card.classList.toggle('hidden-by-filter', !isVisible);
                if (isVisible) {
                    visible.push(card);
                }
            });

            if (sort && sort.value) {
                var sorted = visible.slice().sort(function (a, b) {
                    if (sort.value === 'year') {
                        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                    }
                    if (sort.value === 'title') {
                        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                    }
                    return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
                });
                sorted.forEach(function (card) {
                    scope.appendChild(card);
                });
            }

            if (count) {
                count.textContent = String(visible.length);
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });
        [input, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    });
}

function setupHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                return;
            }
            var target = document.querySelector('[data-filter-form="#library-grid"] [name="keyword"]');
            if (target && window.location.pathname.endsWith('/index.html') || target && window.location.pathname === '/') {
                event.preventDefault();
                target.value = input.value.trim();
                target.dispatchEvent(new Event('input', { bubbles: true }));
                document.querySelector('#library').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));
    players.forEach(function (wrap) {
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('[data-play-button]');
        var source = wrap.getAttribute('data-src');
        var initialized = false;
        var hls = null;

        function initialize() {
            if (initialized || !video || !source) {
                return;
            }
            initialized = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            initialize();
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
            wrap.classList.add('is-playing');
            if (button) {
                button.style.display = 'none';
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                    if (button) {
                        button.style.display = 'inline-flex';
                    }
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.style.display = 'none';
                }
            });
            video.addEventListener('pause', function () {
                if (button) {
                    button.style.display = 'inline-flex';
                }
            });
        }
    });
}
