// Navbar'ı dinamik yükle
document.addEventListener("DOMContentLoaded", () => {
    fetch("navbar.html")
      .then(res => res.text())
      .then(data => {
        document.getElementById("navbar-placeholder").innerHTML = data;
      });
  });
  
  // Swiper ayarları
  const swiper = new Swiper(".mySwiper", {
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    speed: 700,
    effect: 'fade',
    fadeEffect: { crossFade: true },
  });
  