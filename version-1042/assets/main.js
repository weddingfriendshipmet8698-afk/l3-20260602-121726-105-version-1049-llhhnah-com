(function () {
    var header = document.querySelector('[data-sticky-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function onScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
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
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));
    var yearFilters = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
    var searchableCards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        var query = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(' '));
        var year = yearFilters.length ? yearFilters[0].value : '';

        searchableCards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardYear = card.getAttribute('data-year') || '';
            var queryMatch = !query || text.indexOf(query) !== -1;
            var yearMatch = !year || cardYear === year;
            card.setAttribute('data-search-hidden', queryMatch && yearMatch ? 'false' : 'true');
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    yearFilters.forEach(function (select) {
        select.addEventListener('change', applyFilters);
    });

    function attachPlayer(shell) {
        var video = shell.querySelector('video[data-video-src]');
        var button = shell.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-video-src');
        var loaded = false;

        function loadAndPlay() {
            if (!loaded) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                loaded = true;
            }
            button.classList.add('is-hidden');
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', loadAndPlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                loadAndPlay();
            } else {
                video.pause();
            }
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
        video.addEventListener('ended', function () {
            button.classList.remove('is-hidden');
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(attachPlayer);
}());
