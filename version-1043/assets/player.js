(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupPlayer(card) {
    var video = card.querySelector('video[data-stream]');
    var button = card.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var hlsInstance = null;
    var started = false;

    function attachStream() {
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (started) {
        video.play();
        return;
      }
      started = true;
      video.setAttribute('controls', 'controls');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
      card.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          video.setAttribute('controls', 'controls');
        });
      }
    }

    button.addEventListener('click', attachStream);
    video.addEventListener('click', function () {
      if (!started) {
        attachStream();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(setupPlayer);
  });
})();
