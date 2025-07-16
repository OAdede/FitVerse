document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Formun varsayılan gönderme işlemini engelle

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const res = await fetch('https://fitverse-backend-ea3y.onrender.com/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    alert('Kayıt başarılı! Lütfen giriş yapın.');
                    window.location.href = 'login.html'; // Başarılı kayıttan sonra giriş sayfasına yönlendir
                } else {
                    alert(`Hata: ${data.msg || 'Bir sorun oluştu.'}`);
                }
            } catch (err) {
                console.error(err);
                alert('Sunucuya bağlanırken bir hata oluştu.');
            }
        });
    }

    // Login Formu için de bir iskelet ekleyelim, bir sonraki adımda kullanacağız
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('https://fitverse-backend-ea3y.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (res.ok) {
                    // Token'ı localStorage'a kaydet
                    localStorage.setItem('token', data.token);
                    alert('Giriş başarılı!');
                    window.location.href = 'profile.html'; // Başarılı girişten sonra profil sayfasına yönlendir
                } else {
                    alert(`Hata: ${data.msg || 'Bir sorun oluştu.'}`);
                }
            } catch (err) {
                console.error(err);
                alert('Sunucuya bağlanırken bir hata oluştu.');
            }
        });
    }
});
