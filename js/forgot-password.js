document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const messageEl = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = '';
        messageEl.className = 'message';

        const email = e.target.email.value;

        try {
            const res = await fetch('http://localhost:3000/api/auth/forgotpassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                messageEl.textContent = data.data; // Başarılı mesajı backend'den al
                messageEl.classList.add('success');
                form.reset();
            } else {
                messageEl.textContent = data.error || 'Bir hata oluştu.';
                messageEl.classList.add('error');
            }

        } catch (err) {
            console.error(err);
            messageEl.textContent = 'Sunucuya bağlanırken bir hata oluştu.';
            messageEl.classList.add('error');
        }
    });
}); 