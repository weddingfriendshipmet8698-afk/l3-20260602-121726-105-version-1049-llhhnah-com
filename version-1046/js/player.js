function bindMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (video.getAttribute('data-ready') === '1') {
            return Promise.resolve();
        }

        video.setAttribute('data-ready', '1');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (typeof Hls !== 'undefined' && Hls.isSupported()) {
            var hls = new Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video._streamHandler = hls;
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function playVideo() {
        if (cover) {
            cover.classList.add('is-hidden');
        }

        attachStream().then(function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        });
    }

    if (cover) {
        cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });
}
