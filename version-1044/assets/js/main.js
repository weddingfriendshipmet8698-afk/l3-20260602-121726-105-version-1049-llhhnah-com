(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-nav-links]');

        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var searchInput = document.querySelector('[data-search-input]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-state]');

        function applyFilters() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title || '',
                    card.dataset.tags || '',
                    card.dataset.genre || '',
                    card.dataset.region || '',
                    card.dataset.type || '',
                    card.dataset.year || ''
                ].join(' ').toLowerCase();

                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchType = !type || card.dataset.type === type;
                var matchYear = !year || card.dataset.year === year;
                var show = matchQuery && matchType && matchYear;

                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [searchInput, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });
})();
