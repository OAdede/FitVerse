document.addEventListener('DOMContentLoaded', () => {
    // Navbar'ı oluşturup sayfaya ekleyen ana fonksiyon
    const initializeNavbar = async () => {
        const navbarPlaceholder = document.getElementById('navbar-placeholder');
        if (!navbarPlaceholder) {
            console.error('Navbar placeholder not found!');
            return;
        }

        const token = localStorage.getItem('token');
        let user = null;

        // Eğer token varsa, kullanıcı bilgilerini çek
        if (token) {
            try {
                const res = await fetch('http://localhost:3000/api/profile/me', {
                    headers: { 'x-auth-token': token }
                });
                if (res.ok) {
                    const profile = await res.json();
                    user = profile.user; 
                } else {
                    // Token geçersizse temizle
                    console.error('Invalid token, clearing localStorage.');
                    localStorage.removeItem('token');
                }
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
                localStorage.removeItem('token'); // Ağ hatasında da token'ı temizle
            }
        }
        
        // --- HTML OLUŞTURMA BAŞLANGICI ---

        // Alt navbar (her zaman aynı)
        const bottomNavHTML = `
            <nav class="navbar-bottom">
                <ul class="nav-links">
                    <li><a href="../html/homepage.html">Home</a></li>
                    <li><a href="../html/movements.html">Movements</a></li>
                    <li><a href="../html/recipes.html">Fit Recipes</a></li>
                    <li class="dropdown">
                        <a href="../html/calculations.html">Calculators</a>
                        <div class="dropdown-menu">
                            <a href="../html/bmi.html">BMI Calculator</a>
                            <a href="../html/calories.html">Calorie Needs</a>
                            <a href="../html/bodyfat.html">Body Fat</a>
                        </div>
                    </li>
                    <li><a href="../html/my-status.html">My Status</a></li>
                    <li><a href="../html/news_page.html">News</a></li>
                    <li><a href="../html/faq.html">FAQ</a></li>
                </ul>
            </nav>
        `;

        // Üst navbar (dinamik)
        let topNavHTML = `
            <div class="navbar-top">
                <div class="navbar-top-left">
                    <a href="../html/homepage.html" class="logo-link">
                        <img src="../img/logo3.png" alt="Logo" class="logo-img" />
                        <span class="logo-text">FitVerse</span>
                    </a>
                </div>
                <div class="navbar-search-container">
                    <div class="navbar-search">
                        <input type="text" id="search-input" placeholder="Search..." autocomplete="off" />
                        <img src="../img/search.png" alt="Search" class="search-icon" />
                        <div id="search-results" class="search-results-box"></div>
                    </div>
                </div>
                <div class="navbar-top-right">
        `;

        if (user) {
            // Kullanıcı giriş yapmışsa
            const avatarUrl = user.avatar 
                ? `http://localhost:3000${user.avatar}?${new Date().getTime()}` 
                : '../img/profil.png'; 

            topNavHTML += `
                <span class="welcome-message">Merhaba, ${user.name}</span>
                <a href="../html/profile.html" title="Profilim">
                    <img src="${avatarUrl}" alt="Profile" class="profile-img" id="navbar-user-avatar" />
                </a>
                <div class="settings-dropdown">
                     <img src="../img/setting.png" alt="Settings" class="settings-icon" />
                     <div class="dropdown-content">
                        <a href="../html/favorites.html">Favorilerim</a>
                        <a href="../html/change-password.html">Şifremi Değiştir</a>
                        <a href="#" id="logout-btn">Çıkış Yap</a>
                     </div>
                </div>
            `;
        } else {
            // Kullanıcı giriş yapmamışsa
            topNavHTML += `
                <div class="auth-buttons">
                    <a href="../html/login.html" class="btn login-btn">Giriş Yap</a>
                    <a href="../html/signup.html" class="btn register-btn">Kayıt Ol</a>
                </div>
            `;
        }
        
        topNavHTML += `
                <div class="theme-switch-wrapper">
                    <label class="theme-switch" for="theme-checkbox">
                        <input type="checkbox" id="theme-checkbox" disabled />
                        <div class="slider round">
                            <span class="sun-icon">☀️</span>
                            <span class="moon-icon">🌙</span>
                        </div>
                    </label>
                </div>
                </div>
            </div>
        `;

        // Oluşturulan HTML'i placeholder'a yerleştir
        navbarPlaceholder.innerHTML = topNavHTML + bottomNavHTML;

        // --- EVENT LISTENERS (HTML EKLENDİKTEN SONRA) ---
        
        // Arama özelliği
        const searchInput = document.getElementById('search-input');
        const searchResultsBox = document.getElementById('search-results');

        const searchablePages = [
            { name: 'Ana Sayfa', url: '../html/homepage.html', keywords: ['home', 'ana sayfa'] },
            { name: 'Hareketler', url: '../html/movements.html', keywords: ['movements', 'egzersiz', 'hareketler', 'spor'] },
            { name: 'Fit Tarifler', url: '../html/recipes.html', keywords: ['recipes', 'tarifler', 'yemek', 'beslenme', 'fit'] },
            { name: 'Hesaplayıcılar', url: '../html/calculations.html', keywords: ['calculators', 'hesaplayıcılar'] },
            { name: 'Vücut Kitle İndeksi (VKİ)', url: '../html/bmi.html', keywords: ['bmi', 'vki', 'vücut kitle indeksi'] },
            { name: 'Kalori İhtiyacı', url: '../html/calories.html', keywords: ['kalori', 'ihtiyaç', 'calories'] },
            { name: 'Vücut Yağ Oranı', url: '../html/bodyfat.html', keywords: ['yağ oranı', 'body fat'] },
            { name: 'Durumum', url: '../html/my-status.html', keywords: ['durumum', 'status', 'istatistik', 'grafik'] },
            { name: 'Haberler', url: '../html/news_page.html', keywords: ['news', 'haberler', 'makale'] },
            { name: 'Sıkça Sorulan Sorular (SSS)', url: '../html/faq.html', keywords: ['faq', 'sss', 'soru', 'cevap'] },
            { name: 'Profilim', url: '../html/profile.html', keywords: ['profil', 'profile', 'hesabım'] },
            { name: 'Giriş Yap', url: '../html/login.html', keywords: ['login', 'giriş'] },
            { name: 'Kayıt Ol', url: '../html/signup.html', keywords: ['signup', 'kayıt'] },
        ];

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            searchResultsBox.innerHTML = '';
            if (query.length < 2) {
                searchResultsBox.style.display = 'none';
                return;
            }

            const results = searchablePages.filter(page =>
                page.name.toLowerCase().includes(query) ||
                page.keywords.some(keyword => keyword.toLowerCase().includes(query))
            );

            if (results.length > 0) {
                results.forEach(result => {
                    const resultItem = document.createElement('a');
                    resultItem.href = result.url;
                    resultItem.className = 'search-result-item';
                    resultItem.textContent = result.name;
                    searchResultsBox.appendChild(resultItem);
                });
                searchResultsBox.style.display = 'block';
            } else {
                searchResultsBox.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar-search-container')) {
                searchResultsBox.style.display = 'none';
            }
        });
        
        // Çıkış yap butonu
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('token');
                window.location.href = '../html/login.html';
            });
        }
    };

    // Sayfa yüklendiğinde navbar'ı başlat
    initializeNavbar();
}); 