document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('change-password-form');
    const messageEl = document.getElementById('message');
    const token = localStorage.getItem('token');

    // Kullanıcı giriş yapmamışsa, bu sayfaya erişememeli
    if (!token) {
        window.location.href = '../html/login.html';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageEl.textContent = '';
        messageEl.className = 'message';

        const currentPassword = e.target.currentPassword.value;
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
            const res = await fetch('http://localhost:3000/api/auth/changepassword', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                messageEl.textContent = data.msg;
                messageEl.classList.add('success');
                form.reset();
                setTimeout(() => {
                     // Kullanıcıyı profiline veya anasayfaya yönlendirebiliriz
                    window.location.href = '../html/profile.html';
                }, 2000);
            } else {
                messageEl.textContent = data.msg || 'Bir hata oluştu.';
                messageEl.classList.add('error');
            }

        } catch (err) {
            console.error(err);
            messageEl.textContent = 'Sunucuya bağlanırken bir hata oluştu.';
            messageEl.classList.add('error');
        }
    });
}); 