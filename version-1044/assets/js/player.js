(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movieVideo');
        var cover = document.getElementById('playCover');
        var button = document.getElementById('playButton');
        var hls = null;
        var loaded = false;

        if (!video || !source) {
            return;
        }

        function loadSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }

            video.src = source;
        }

        function startPlayback() {
            loadSource();

            if (cover) {
                cover.classList.add('hidden');
            }

            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
