function setMobileMenu() {
  const button = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function setHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const previous = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let active = 0;
  let timer = null;

  function show(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  }

  function restart() {
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      show(active + 1);
    }, 5000);
  }

  if (previous) {
    previous.addEventListener("click", function () {
      show(active - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(active + 1);
      restart();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      show(Number(dot.getAttribute("data-hero-dot")) || 0);
      restart();
    });
  });

  restart();
}

function uniqueValues(cards, key) {
  const values = new Set();
  cards.forEach(function (card) {
    const value = card.dataset[key];
    if (value) {
      values.add(value);
    }
  });
  return Array.from(values).sort(function (a, b) {
    return b.localeCompare(a, "zh-Hans-CN", { numeric: true });
  });
}

function fillSelect(select, values) {
  if (!select) {
    return;
  }
  values.forEach(function (value) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function setFilters() {
  const panels = Array.from(document.querySelectorAll("[data-filter-panel]"));
  panels.forEach(function (panel) {
    const section = panel.parentElement;
    const grid = section ? section.querySelector("[data-filterable]") : null;
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
    const input = panel.querySelector("[data-filter-input]");
    const region = panel.querySelector("[data-filter-region]");
    const type = panel.querySelector("[data-filter-type]");
    const year = panel.querySelector("[data-filter-year]");

    fillSelect(region, uniqueValues(cards, "region"));
    fillSelect(type, uniqueValues(cards, "type"));
    fillSelect(year, uniqueValues(cards, "year"));

    function apply() {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const regionValue = region ? region.value : "";
      const typeValue = type ? type.value : "";
      const yearValue = year ? year.value : "";

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(" ").toLowerCase();
        const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchedRegion = !regionValue || card.dataset.region === regionValue;
        const matchedType = !typeValue || card.dataset.type === typeValue;
        const matchedYear = !yearValue || card.dataset.year === yearValue;
        card.classList.toggle("is-filter-hidden", !(matchedKeyword && matchedRegion && matchedType && matchedYear));
      });
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
}

function bindMoviePlayer(videoId, buttonId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  if (!video || !button || !streamUrl) {
    return;
  }
  let attached = false;

  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    attach();
    button.classList.add("is-hidden");
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
}

document.addEventListener("DOMContentLoaded", function () {
  setMobileMenu();
  setHero();
  setFilters();
});
