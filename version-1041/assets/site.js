(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var button = qs('.menu-toggle');
        var nav = qs('.site-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });
        play();
    }

    function initHomeSearch() {
        var input = qs('#homeSearch');
        var button = qs('[data-home-search]');
        if (!input || !button) {
            return;
        }
        function submit() {
            var value = encodeURIComponent(input.value.trim());
            window.location.href = value ? './search.html?q=' + value : './search.html';
        }
        button.addEventListener('click', submit);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                submit();
            }
        });
    }

    function initFilter() {
        var wrap = qs('[data-filter-wrap]');
        if (!wrap) {
            return;
        }
        var keyword = qs('[data-filter-keyword]');
        var year = qs('[data-filter-year]');
        var type = qs('[data-filter-type]');
        var cards = qsa('[data-title]', wrap);
        var params = new URLSearchParams(window.location.search);
        if (keyword && params.get('q')) {
            keyword.value = params.get('q');
        }

        function apply() {
            var kw = normalize(keyword && keyword.value);
            var yr = normalize(year && year.value);
            var tp = normalize(type && type.value);
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var matchKeyword = !kw || haystack.indexOf(kw) !== -1;
                var matchYear = !yr || normalize(card.getAttribute('data-year')) === yr;
                var matchType = !tp || haystack.indexOf(tp) !== -1;
                card.classList.toggle('hidden-card', !(matchKeyword && matchYear && matchType));
            });
        }

        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    window.setupMoviePlayer = function (videoId, layerId, src) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        if (!video || !src) {
            return;
        }

        function start() {
            if (layer) {
                layer.classList.add('is-hidden');
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.play().catch(function () {});
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }
            video.src = src;
            video.play().catch(function () {});
        }

        if (layer) {
            layer.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initHomeSearch();
        initFilter();
    });
})();
