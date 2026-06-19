(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
        var dotsWrap = carousel.querySelector('[data-carousel-dots]');
        var prev = carousel.querySelector('[data-carousel-prev]');
        var next = carousel.querySelector('[data-carousel-next]');
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            if (dotsWrap) {
                Array.prototype.slice.call(dotsWrap.querySelectorAll('button')).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (dotsWrap) {
            slides.forEach(function (_, slideIndex) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第' + (slideIndex + 1) + '屏');
                dot.addEventListener('click', function () {
                    show(slideIndex);
                    restart();
                });
                dotsWrap.appendChild(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    });

    document.querySelectorAll('[data-search-input]').forEach(function (input) {
        var scope = input.closest('main') || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year]'));
        var empty = scope.querySelector('[data-empty-state]');
        var activeYear = 'all';

        function normalize(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function apply() {
            var query = normalize(input.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var year = card.getAttribute('data-year') || '';
                var yearMatched = activeYear === 'all' || year.indexOf(activeYear) !== -1;
                var queryMatched = !query || haystack.indexOf(query) !== -1;
                var matched = yearMatched && queryMatched;

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeYear = chip.getAttribute('data-filter-year') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });

        input.addEventListener('input', apply);
        apply();
    });
})();
