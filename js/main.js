(function () {
  "use strict";

  // Mark JS as available — CSS scroll-reveal rules only apply once this class exists,
  // so the page stays fully visible for anyone without JS enabled.
  document.documentElement.classList.add("js-ready");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ */
  /* Footer year                                                        */
  /* ------------------------------------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* Mobile navigation                                                   */
  /* ------------------------------------------------------------------ */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  function closeNav() {
    if (!mainNav || !navToggle) return;
    mainNav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveal                                                       */
  /* ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // No IntersectionObserver support, or the visitor prefers reduced motion:
    // show everything immediately instead of animating it in.
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ------------------------------------------------------------------ */
  /* Hero carousel                                                       */
  /* Touch/pen swipe natively (overflow-x + scroll-snap). Arrows and dots */
  /* give an easier, more discoverable way to move between slides, and   */
  /* the active dot visibly fills up as a timer while autoplay runs.     */
  /* ------------------------------------------------------------------ */
  var track = document.getElementById("carouselTrack");
  var dots = document.querySelectorAll("#carouselDots .carousel-dot");
  var prevBtn = document.getElementById("carouselPrev");
  var nextBtn = document.getElementById("carouselNext");

  if (track && dots.length) {
    var slideCount = dots.length;
    var autoplayTimer = null;
    var currentIndex = 0;

    function setActiveDot(index, filling) {
      currentIndex = index;
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        // Restart the CSS fill animation cleanly: remove it, force a reflow,
        // then re-add it — otherwise the browser just ignores the re-trigger.
        dot.classList.remove("is-filling");
        void dot.offsetWidth;
        if (i === index && filling) dot.classList.add("is-filling");
      });
    }

    function goToSlide(index, filling) {
      index = Math.max(0, Math.min(slideCount - 1, index));
      track.scrollTo({ left: track.clientWidth * index, behavior: reduceMotion ? "auto" : "smooth" });
      setActiveDot(index, filling);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        stopAutoplay();
        goToSlide(i, false);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        stopAutoplay();
        goToSlide((currentIndex - 1 + slideCount) % slideCount, false);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        stopAutoplay();
        goToSlide((currentIndex + 1) % slideCount, false);
      });
    }

    // Touch/trackpad swipes still move the track natively; keep the dots synced.
    var scrollTimeout;
    track.addEventListener("scroll", function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        var index = Math.round(track.scrollLeft / track.clientWidth);
        if (index !== currentIndex) {
          stopAutoplay();
          setActiveDot(index, false);
        }
      }, 100);
    });

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      dots.forEach(function (dot) { dot.classList.remove("is-filling"); });
    }

    function startAutoplay() {
      if (reduceMotion) return;
      setActiveDot(currentIndex, true);
      autoplayTimer = setInterval(function () {
        goToSlide((currentIndex + 1) % slideCount, true);
      }, 4500);
    }

    startAutoplay();
  }
})();
