document.querySelectorAll('.toggle-answer').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isActive = item.classList.contains('active');

    // Tüm diğer açık cevapları kapat
    document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('active'));

    // Eğer zaten açıksa kapat, değilse aç
    if (!isActive) item.classList.add('active');
  });
});
