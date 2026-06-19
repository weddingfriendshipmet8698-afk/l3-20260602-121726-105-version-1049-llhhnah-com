(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () {
      img.classList.add("image-missing");
    }, { once: true });
  });

  document.querySelectorAll(".hero-slider").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }

      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll(".filter-scope").forEach(function (scope) {
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-year-filter]");
    var category = scope.querySelector("[data-category-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
    var empty = scope.querySelector("[data-empty]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var term = normalize(input ? input.value : "");
      var yearValue = year ? year.value : "";
      var categoryValue = category ? category.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var cardCategory = card.getAttribute("data-category") || "";
        var ok = true;

        if (term && text.indexOf(term) === -1) {
          ok = false;
        }

        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }

        if (categoryValue && cardCategory !== categoryValue) {
          ok = false;
        }

        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("[data-player-video]");
    var overlay = player.querySelector("[data-play-button]");
    var prepared = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function prepare() {
      var stream = video.getAttribute("data-stream");

      if (!stream) {
        return;
      }

      if (!prepared) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
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

        prepared = true;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", prepare);
    }

    video.addEventListener("click", function () {
      if (!prepared || video.paused) {
        prepare();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
