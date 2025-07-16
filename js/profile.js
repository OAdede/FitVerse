document.addEventListener('DOMContentLoaded', () => {
    // Footer'ı yükle
    fetch("../html/footer.html")
        .then(res => res.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;
        });

    const token = localStorage.getItem('token');
    const updateForm = document.getElementById('update-profile-form');
    const avatarForm = document.getElementById('avatar-upload-form');
    const avatarInput = document.getElementById('avatar-input');
    const avatarPreview = document.getElementById('avatar-preview');
    const removeAvatarBtn = document.getElementById('remove-avatar-btn');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // FormData gönderirken Content-Type'ı belirtme, tarayıcı halleder.
    const authHeaderOnly = {
        'x-auth-token': token
    };

    const headersWithContent = {
        'Content-Type': 'application/json',
        'x-auth-token': token
    };

    // Mevcut profil bilgilerini getir ve göster
    const fetchProfile = async () => {
        try {
            // Profil ve favori verilerini aynı anda çek
            const [profileRes, favoritesRes] = await Promise.all([
                fetch('https://fitverse-backend-ea3y.onrender.com/api/profile/me', { headers: authHeaderOnly }),
                fetch('https://fitverse-backend-ea3y.onrender.com/api/profile/favorites', { headers: authHeaderOnly }) // Bu endpoint'i daha sonra oluşturacağız
            ]);

            if (!profileRes.ok) {
                if (profileRes.status === 401 || profileRes.status === 403) {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                }
                return;
            }

            const profile = await profileRes.json();
            
            // Bilgileri "Mevcut Bilgiler" kısmında göster
            document.getElementById('display-name').textContent = profile.user.name;
            document.getElementById('display-height').textContent = profile.height || '-';
            document.getElementById('display-weight').textContent = profile.weight || '-';
            document.getElementById('display-age').textContent = profile.age || '-';
            document.getElementById('display-gender').textContent = profile.gender === 'male' ? 'Erkek' : profile.gender === 'female' ? 'Kadın' : '-';
            document.getElementById('display-waist').textContent = profile.waist || '-';
            document.getElementById('display-neck').textContent = profile.neck || '-';

            // Avatarı güncelle
            if (profile.user.avatar) {
                // Önbelleği atlamak için zaman damgası ekle
                avatarPreview.src = `https://fitverse-backend-ea3y.onrender.com${profile.user.avatar}?${new Date().getTime()}`;
            } else {
                avatarPreview.src = '../img/profil.png'; // Varsayılan avatar
            }

            // Formu mevcut verilerle doldur
            if (updateForm) {
                document.getElementById('height').value = profile.height || '';
                document.getElementById('weight').value = profile.weight || '';
                document.getElementById('age').value = profile.age || '';
                document.getElementById('gender').value = profile.gender || '';
                document.getElementById('waist').value = profile.waist || '';
                document.getElementById('neck').value = profile.neck || '';
            }
        } catch (err) {
            console.error('Profil alınırken hata:', err);
        }
    };
    
    // Form gönderildiğinde profili güncelle
    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const profileData = {
                height: document.getElementById('height').value,
                weight: document.getElementById('weight').value,
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                waist: document.getElementById('waist').value,
                neck: document.getElementById('neck').value,
            };

            try {
                const res = await fetch('https://fitverse-backend-ea3y.onrender.com/api/profile', {
                    method: 'POST',
                    headers: headersWithContent,
                    body: JSON.stringify(profileData)
                });

                if (res.ok) {
                    alert('Profil başarıyla güncellendi!');
                    fetchProfile(); // Bilgileri tazelemek için yeniden çek
                } else {
                    const errorData = await res.json();
                    alert(`Profil güncellenirken bir hata oluştu: ${errorData.msg || 'Bilinmeyen Hata'}`);
                }
            } catch (err) {
                console.error('Profil güncellenirken hata:', err);
            }
        });
    }

    // Avatar dosya seçimi için önizleme
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // Avatar yükleme formu
    if (avatarForm) {
        avatarForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const file = avatarInput.files[0];
            if (!file) {
                alert('Lütfen bir fotoğraf seçin.');
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const res = await fetch('https://fitverse-backend-ea3y.onrender.com/api/profile/upload-avatar', {
                    method: 'POST',
                    headers: authHeaderOnly, // Sadece auth token, Content-Type yok
                    body: formData
                });

                if (res.ok) {
                    const result = await res.json();
                    alert('Profil fotoğrafı başarıyla güncellendi!');
                    // Yeni avatarı hem sayfada hem de navbar'da anında güncelle
                    const newAvatarUrl = `https://fitverse-backend-ea3y.onrender.com${result.data}?${new Date().getTime()}`;
                    avatarPreview.src = newAvatarUrl;
                    // Navbar'daki avatarı da güncelle (auth.js'in bu elementi bulabilmesi lazım)
                    const navbarAvatar = document.getElementById('navbar-user-avatar');
                    if (navbarAvatar) {
                        navbarAvatar.src = newAvatarUrl;
                    }
                } else {
                    const errorData = await res.json();
                    alert(`Fotoğraf yüklenirken bir hata oluştu: ${errorData.msg || 'Bilinmeyen Hata'}`);
                    fetchProfile(); // Hata durumunda eski resmi geri yükle
                }
            } catch (err) {
                console.error('Avatar yüklenirken hata:', err);
            }
        });
    }

    // Avatar kaldırma butonu
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', async () => {
            if (!confirm('Profil fotoğrafınızı kaldırmak istediğinizden emin misiniz?')) {
                return;
            }

            try {
                const res = await fetch('https://fitverse-backend-ea3y.onrender.com/api/profile/avatar', {
                    method: 'DELETE',
                    headers: authHeaderOnly
                });

                if (res.ok) {
                    const result = await res.json();
                    alert('Profil fotoğrafı başarıyla kaldırıldı.');
                    
                    const defaultAvatarUrl = `https://fitverse-backend-ea3y.onrender.com${result.data}?${new Date().getTime()}`;
                    avatarPreview.src = defaultAvatarUrl;

                    const navbarAvatar = document.getElementById('navbar-user-avatar');
                    if (navbarAvatar) {
                        navbarAvatar.src = defaultAvatarUrl;
                    }
                } else {
                    const errorData = await res.json();
                    alert(`Fotoğraf kaldırılırken bir hata oluştu: ${errorData.msg || 'Bilinmeyen Hata'}`);
                }
            } catch (err) {
                console.error('Avatar kaldırılırken hata:', err);
                alert('Sunucuyla iletişim kurulurken bir hata oluştu.');
            }
        });
    }

    // Çıkış yap butonu
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    // Sayfa yüklendiğinde profili getir
    fetchProfile();
}); 