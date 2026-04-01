// MASK SERVIS - jednoduché interakcie bez závislostí
// Dôležité miesta na úpravu:
// - telefón a email sú v index.html cez tel: a mailto:
// - galéria sa upravuje v poli galleryItems nižšie
// - mapu neskôr vložte do HTML namiesto placeholderu

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const siteHeader = document.querySelector(".site-header");
const currentYear = document.querySelector("#current-year");
const galleryGrid = document.querySelector("#gallery-grid");
const galleryViewport = document.querySelector("#gallery-viewport");
const galleryPrev = document.querySelector("#gallery-prev");
const galleryNext = document.querySelector("#gallery-next");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPrev = document.querySelector(".lightbox-prev");
const lightboxNext = document.querySelector(".lightbox-next");
const heroRotatingWord = document.querySelector("#hero-rotating-word");
const magneticTargets = document.querySelectorAll(
  ".btn, .hero-cta, .nav-phone, .gallery-nav, .contact-card, .lightbox-close, .lightbox-nav, .nav-toggle, .site-nav a, .floating-call"
);

// Upraviteľné slová pre headline v hero sekcii.
const heroWords = ["chaosu", "neporiadku", "starostí", "zbytočností"];

const galleryItems = Array.from({ length: 20 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");

  return {
    src: `assets/gallery/gallery-${number}.jpg`,
    alt: `Ukážka práce MASK SERVIS ${number}`,
    caption: `Galéria prác ${number}`
  };
});

let currentGalleryIndex = 0;
let heroWordIndex = 0;
let gallerySlideIndex = 0;
let galleryItemsPerView = 2;

function updateHeaderState() {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
}

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function setupHeroRotator() {
  if (!heroRotatingWord) return;

  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "nowrap";
  probe.style.font = getComputedStyle(heroRotatingWord).font;
  document.body.appendChild(probe);

  let maxWidth = 0;
  heroWords.forEach((word) => {
    probe.textContent = word;
    maxWidth = Math.max(maxWidth, probe.getBoundingClientRect().width);
  });

  document.body.removeChild(probe);
  heroRotatingWord.style.minWidth = `${Math.ceil(maxWidth)}px`;

  window.setInterval(() => {
    heroRotatingWord.classList.add("is-changing");

    window.setTimeout(() => {
      heroWordIndex = (heroWordIndex + 1) % heroWords.length;
      heroRotatingWord.textContent = heroWords[heroWordIndex];
      heroRotatingWord.classList.remove("is-changing");
    }, 320);
  }, 2800);
}

function setupMagneticButtons() {
  if (!magneticTargets.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  magneticTargets.forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      const bounds = element.getBoundingClientRect();
      const offsetX = event.clientX - bounds.left - bounds.width / 2;
      const offsetY = event.clientY - bounds.top - bounds.height / 2;
      const moveX = (offsetX / bounds.width) * 14;
      const moveY = (offsetY / bounds.height) * 12;

      element.style.setProperty("--magnet-x", `${moveX}px`);
      element.style.setProperty("--magnet-y", `${moveY}px`);
      element.style.setProperty("--magnet-scale", "1.04");
    });

    element.addEventListener("mouseleave", () => {
      element.style.setProperty("--magnet-x", "0px");
      element.style.setProperty("--magnet-y", "0px");
      element.style.setProperty("--magnet-scale", "1");
    });
  });
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";

    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    navToggle.setAttribute("aria-label", isExpanded ? "Otvoriť menu" : "Zavrieť menu");
    siteNav.classList.toggle("is-open", !isExpanded);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Otvoriť menu");
      siteNav.classList.remove("is-open");
    });
  });
}

updateHeaderState();
setupHeroRotator();
setupMagneticButtons();
document.addEventListener("scroll", updateHeaderState);

function renderGallery() {
  if (!galleryGrid) return;

  galleryGrid.innerHTML = "";

  galleryItems.forEach((item, index) => {
    const galleryButton = document.createElement("button");

    galleryButton.type = "button";
    galleryButton.className = "gallery-item";
    galleryButton.setAttribute("data-index", String(index));
    galleryButton.setAttribute("aria-label", `Otvoriť fotografiu ${index + 1}`);

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = "lazy";
    image.width = 800;
    image.height = 800;

    const badge = document.createElement("span");
    badge.textContent = item.caption;

    galleryButton.append(image, badge);
    galleryGrid.appendChild(galleryButton);
  });
}

function updateGalleryItemsPerView() {
  if (window.innerWidth >= 760) {
    galleryItemsPerView = 4;
  } else {
    galleryItemsPerView = 3;
  }
}

function updateGallerySlider() {
  if (!galleryGrid) return;

  const maxIndex = Math.max(0, galleryItems.length - galleryItemsPerView);
  gallerySlideIndex = Math.min(gallerySlideIndex, maxIndex);

  const firstItem = galleryGrid.querySelector(".gallery-item");
  if (!firstItem) return;

  const itemWidth = firstItem.getBoundingClientRect().width;
  const gap = 16;
  galleryGrid.style.transform = `translateX(-${gallerySlideIndex * (itemWidth + gap)}px)`;

  if (galleryPrev) galleryPrev.disabled = gallerySlideIndex === 0;
  if (galleryNext) galleryNext.disabled = gallerySlideIndex >= maxIndex;
}

function openLightbox(index) {
  const item = galleryItems[index];
  if (!item || !lightbox || !lightboxImage || !lightboxCaption) return;

  currentGalleryIndex = index;
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

function stepLightbox(direction) {
  const lastIndex = galleryItems.length - 1;
  if (direction === "next") {
    currentGalleryIndex = currentGalleryIndex >= lastIndex ? 0 : currentGalleryIndex + 1;
  } else {
    currentGalleryIndex = currentGalleryIndex <= 0 ? lastIndex : currentGalleryIndex - 1;
  }
  openLightbox(currentGalleryIndex);
}

if (galleryGrid) {
  renderGallery();
  updateGalleryItemsPerView();
  window.setTimeout(updateGallerySlider, 0);
}

if (galleryPrev) {
  galleryPrev.addEventListener("click", () => {
    gallerySlideIndex = Math.max(0, gallerySlideIndex - 1);
    updateGallerySlider();
  });
}

if (galleryNext) {
  galleryNext.addEventListener("click", () => {
    const maxIndex = Math.max(0, galleryItems.length - galleryItemsPerView);
    gallerySlideIndex = Math.min(maxIndex, gallerySlideIndex + 1);
    updateGallerySlider();
  });
}

if (galleryGrid) {
  galleryGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest(".gallery-item");
    if (!trigger) return;

    const index = Number(trigger.getAttribute("data-index"));
    openLightbox(index);
  });
}

if (galleryViewport) {
  let touchStartX = 0;
  let touchDeltaX = 0;

  galleryViewport.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchDeltaX = 0;
    },
    { passive: true }
  );

  galleryViewport.addEventListener(
    "touchmove",
    (event) => {
      touchDeltaX = event.changedTouches[0].clientX - touchStartX;
    },
    { passive: true }
  );

  galleryViewport.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) < 40) return;

    const maxIndex = Math.max(0, galleryItems.length - galleryItemsPerView);
    if (touchDeltaX < 0) {
      gallerySlideIndex = Math.min(maxIndex, gallerySlideIndex + 1);
    } else {
      gallerySlideIndex = Math.max(0, gallerySlideIndex - 1);
    }

    updateGallerySlider();
  });
}

window.addEventListener("resize", () => {
  updateGalleryItemsPerView();
  updateGallerySlider();
});

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxPrev) {
  lightboxPrev.addEventListener("click", () => stepLightbox("prev"));
}

if (lightboxNext) {
  lightboxNext.addEventListener("click", () => stepLightbox("next"));
}

if (lightbox) {
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (!lightbox || lightbox.hidden) return;

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowRight") {
    stepLightbox("next");
  }

  if (event.key === "ArrowLeft") {
    stepLightbox("prev");
  }
});
