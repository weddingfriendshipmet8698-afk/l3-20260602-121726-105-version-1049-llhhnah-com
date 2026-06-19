(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector('[data-hls-video]');
    var playButton = document.querySelector('[data-play-button]');
    var overlay = document.querySelector('[data-player-overlay]');
    var message = document.querySelector('[data-player-message]');
    var hlsInstance = null;
    var initialized = false;

    if (!video || !playButton) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function initializePlayer() {
      if (initialized) {
        return Promise.resolve();
      }

      var source = video.getAttribute('data-src');
      if (!source) {
        setMessage('播放源缺失，暂时无法播放。');
        return Promise.reject(new Error('Missing HLS source'));
      }

      initialized = true;
      setMessage('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已加载，可以开始播放。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请稍后重试。');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('正在使用浏览器原生 HLS 播放。');
        return Promise.resolve();
      }

      setMessage('当前浏览器不支持 HLS 播放，请使用新版浏览器访问。');
      return Promise.reject(new Error('HLS is not supported'));
    }

    playButton.addEventListener('click', function () {
      initializePlayer()
        .then(function () {
          if (overlay) {
            overlay.classList.add('hidden');
          }
          return video.play();
        })
        .catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      setMessage('已暂停，点击播放器控件可继续播放。');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
