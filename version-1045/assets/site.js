(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".main-nav");
    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }

    var index = 0;
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var previous = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var scope = panel.closest("main") || document;
      var search = panel.querySelector("[data-card-search]");
      var typeSelect = panel.querySelector('[data-card-select="type"]');
      var yearSelect = panel.querySelector('[data-card-select="year"]');
      var clear = panel.querySelector("[data-clear-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      var empty = scope.querySelector("[data-empty-tip]");

      fillSelect(typeSelect, cards, "type");
      fillSelect(yearSelect, cards, "year", true);

      function apply() {
        var q = search ? search.value.trim().toLowerCase() : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var ok = (!q || haystack.indexOf(q) !== -1) && (!type || cardType === type) && (!year || cardYear === year);
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (search) {
        search.addEventListener("input", apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (yearSelect) {
        yearSelect.addEventListener("change", apply);
      }
      if (clear) {
        clear.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          apply();
        });
      }
    });
  }

  function fillSelect(select, cards, key, reverse) {
    if (!select) {
      return;
    }
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute("data-" + key);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    values.sort(function (a, b) {
      if (reverse) {
        return String(b).localeCompare(String(a), "zh-Hans-CN", { numeric: true });
      }
      return String(a).localeCompare(String(b), "zh-Hans-CN", { numeric: true });
    });
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }
})();

function initMoviePlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  if (!video || !button) {
    return;
  }

  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls();
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    video.controls = true;
    attached = true;
  }

  function start() {
    attach();
    button.classList.add("hidden");
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
