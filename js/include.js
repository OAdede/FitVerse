// js/include.js

document.addEventListener("DOMContentLoaded", () => {
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (footerPlaceholder) {
    fetch("../html/footer.html")
      .then(res => res.text())
      .then(data => {
        footerPlaceholder.innerHTML = data;

        // Footer yüklendikten sonra formu dinle
        const newsletterForm = footerPlaceholder.querySelector('.newsletter');
        if (newsletterForm) {
          newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value;

            if (!email) {
              alert('Lütfen e-posta adresinizi girin.');
              return;
            }

            try {
              const res = await fetch('http://localhost:3000/api/contact/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              });

              if (res.ok) {
                alert('İletişim talebiniz başarıyla gönderildi. Teşekkür ederiz!');
                emailInput.value = '';
              } else {
                alert('Bir hata oluştu. Lütfen tekrar deneyin.');
              }
            } catch (error) {
              console.error('Footer iletişim hatası:', error);
              alert('Sunucuya bağlanırken bir hata oluştu.');
            }
          });
        }
      });
  }
});
