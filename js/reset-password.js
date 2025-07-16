document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const messageEl = document.getElementById('message');

    // URL'den token'ı al
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        messageEl.textContent = 'Geçersiz sıfırlama linki.';
        messageEl.classList.add('error');
        form.style.display = 'none'; // Token yoksa formu gizle
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = '';
        messageEl.className = 'message';

        const newPassword = e.target.newPassword.value;
        const confirmPassword = e.target.confirmPassword.value;

        if (newPassword !== confirmPassword) {
            messageEl.textContent = 'Yeni şifreler uyuşmuyor!';
            messageEl.classList.add('error');
            return;
        }

        if (newPassword.length < 6) {
            messageEl.textContent = 'Yeni şifre en az 6 karakter olmalıdır.';
            messageEl.classList.add('error');
            return;
        }

        try {
            const res = await fetch(`https://fitverse-backend-ea3y.onrender.com/api/auth/resetpassword/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                messageEl.textContent = 'Şifreniz başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz...';
                messageEl.classList.add('success');
                form.reset();
                setTimeout(() => {
                    window.location.href = '../html/login.html';
                }, 3000);
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