// js/include.js

document.addEventListener("DOMContentLoaded", () => {
  const loadHTML = (elementId, filePath, callback) => {
    const element = document.getElementById(elementId);
    if (element) {
      fetch(filePath)
        .then(res => {
          if (!res.ok) throw new Error(`Could not load ${filePath}`);
          return res.text();
        })
        .then(data => {
          element.innerHTML = data;
          if (callback) callback();
        })
        .catch(error => console.error('Error including HTML:', error));
    }
  };

  // Sadece Footer'ı yükle ve yüklendikten sonra formu dinle
  loadHTML("footer-placeholder", "../html/footer.html", () => {
    const newsletterForm = document.querySelector('.newsletter');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Formun sayfa yenilemesini engelle
        const emailInput = newsletterForm.querySelector('input[type="email"]');
        const email = emailInput.value;

        if (!email) {
          alert('Lütfen e-posta adresinizi girin.');
          return;
        }

        try {
          const res = await fetch('https://fitverse-backend-ea3y.onrender.com/api/contact/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: email,
              question: 'Footer "Bize Ulaşın" formundan iletişim talebi.' 
            }),
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
});
