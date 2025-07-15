document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../html/login.html';
        return;
    }

    const recipeContainer = document.getElementById('favorite-recipes-container');
    const movementContainer = document.getElementById('favorite-movements-container');

    // Favori Tarifleri Çek ve Render Et
    const fetchAndRenderFavoriteRecipes = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/profile/favorites', {
                headers: { 'x-auth-token': token }
            });
            const recipes = await res.json();
            recipeContainer.innerHTML = '';
            if (recipes.length === 0) {
                recipeContainer.innerHTML = '<p style="text-align:center; width: 100%;">Henüz favori tarifiniz yok.</p>';
                return;
            }
            recipes.forEach(recipe => {
                const card = document.createElement('div');
                card.className = 'recipe-card';
                card.setAttribute('data-id', recipe._id);
                card.innerHTML = `
                    <img src="${recipe.image}" alt="${recipe.title}" />
                    <div class="info">
                        <h3>${recipe.title}</h3>
                        <p>🔋 ${recipe.calories} kcal | ⏱️ ${recipe.duration} dk</p>
                        <button class="expand-btn">Tarifi Gör</button>
                        <div class="recipe-details"><p>${recipe.steps.join('</p><p>')}</p></div>
                        <div class="action-buttons">
                           <button class="favorite-button favorited" title="Favorilerden Çıkar"><i class="fa-solid fa-star"></i></button>
                        </div>
                    </div>`;
                recipeContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Favori tarifler yüklenemedi:', error);
            recipeContainer.innerHTML = '<p>Favori tarifler yüklenirken bir hata oluştu.</p>';
        }
    };

    // Favori Hareketleri Çek ve Render Et
    const fetchAndRenderFavoriteMovements = async () => {
        try {
             // Kullanıcı profili ve favori hareketleri aynı anda çek
            const [profileRes, movementsRes] = await Promise.all([
                fetch('http://localhost:3000/api/profile/me', { headers: { 'x-auth-token': token } }),
                fetch('http://localhost:3000/api/profile/favorite-movements', { headers: { 'x-auth-token': token } })
            ]);

            if (!profileRes.ok || !movementsRes.ok) {
                throw new Error('Favori hareketler veya profil bilgisi alınamadı.');
            }

            const profileData = await profileRes.json();
            const movements = await movementsRes.json();
            const userProfile = profileData.user;

            movementContainer.innerHTML = '';
            if (movements.length === 0) {
                movementContainer.innerHTML = '<p style="text-align:center; width: 100%;">Henüz favori hareketiniz yok.</p>';
                return;
            }
            movements.forEach(movement => {
                let userRating = 0;
                // Daha güvenli kontrol: `ratings` dizisinin var olduğundan ve bir dizi olduğundan emin ol
                if (userProfile && movement.ratings && Array.isArray(movement.ratings)) {
                    // ID'leri string'e çevirerek karşılaştır
                    const ratingObj = movement.ratings.find(r => String(r.user) === userProfile._id);
                    if (ratingObj) {
                        userRating = ratingObj.rating;
                    }
                }

                // Ortalama puanı güvenli bir şekilde formatla
                const avgRatingText = typeof movement.averageRating === 'number' 
                    ? movement.averageRating.toFixed(1) 
                    : 'N/A';

                const card = document.createElement('div');
                card.className = 'video-card';
                card.setAttribute('data-id', movement._id);
                card.innerHTML = `
                    <iframe src="${movement.youtubeUrl}" allowfullscreen></iframe>
                    <div class="title">${movement.name}</div>
                    <div class="rating-section">
                        <div class="rating-stars">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <i class="fa-solid fa-dumbbell rating-dumbbell ${i <= userRating ? 'active' : ''}" data-value="${i}"></i>
                            `).join('')}
                        </div>
                        <span class="average-rating">Ort: ${avgRatingText}</span>
                    </div>
                     <p class="description">${movement.description || 'Açıklama mevcut değil.'}</p>
                    <div class="action-buttons" style="justify-content: center; gap: 20px;">
                        <button class="favorite-button favorited" title="Favorilerden Çıkar"><i class="fa-solid fa-star"></i></button>
                         <button class="share-button" data-title="${movement.name}" data-url="${window.location.origin}/html/${movement.category}.html#${movement._id}">
                            <i class="fa-solid fa-share-nodes"></i>
                        </button>
                    </div>`;
                movementContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Favori hareketler yüklenemedi:', error);
            movementContainer.innerHTML = '<p>Favori hareketler yüklenirken bir hata oluştu.</p>';
        }
    };
    
    // Olay dinleyicileri
    document.body.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        const ratingIcon = e.target.closest('.rating-dumbbell');
        
        if (button) {
             if (button.classList.contains('favorite-button')) {
                const card = button.closest('.recipe-card, .video-card');
                const id = card.getAttribute('data-id');
                const isRecipe = card.classList.contains('recipe-card');
                const url = isRecipe
                    ? `http://localhost:3000/api/recipes/${id}/favorite`
                    : `http://localhost:3000/api/movements/${id}/favorite`;
                // Not: Tarif favori API'si PUT kullanıyor olabilir, bu kodda POST varsayılıyor.
                // Eğer farklıysa, `movementController`'daki gibi bir yapı kurulmalı.
                const method = isRecipe ? 'PUT' : 'POST';

                try {
                    const res = await fetch(url, {
                        method: method,
                        headers: { 'x-auth-token': token }
                    });
                    if (res.ok) {
                        card.style.transition = 'opacity 0.3s ease';
                        card.style.opacity = '0';
                        setTimeout(() => card.remove(), 300);
                    } else {
                        alert('Öğe favorilerden kaldırılamadı.');
                    }
                } catch (error) {
                    console.error('Favori kaldırma hatası:', error);
                }
             } else if (button.classList.contains('share-button')) {
                const title = button.dataset.title;
                const url = button.dataset.url;
                if (navigator.share) {
                    navigator.share({
                        title: `${title} | FitVerse`,
                        text: `Bu harika FitVerse içeriğine göz at: ${title}`,
                        url: url,
                    }).catch(err => console.error('Paylaşma hatası:', err));
                } else {
                    navigator.clipboard.writeText(url).then(() => {
                        alert('Link panoya kopyalandı!');
                    }).catch(err => {
                        console.error('Pano hatası:', err);
                        alert('Link kopyalanamadı.');
                    });
                }
             }
        }
        
        if(ratingIcon) {
            const card = ratingIcon.closest('.video-card');
            const movementId = card.dataset.id;
            const ratingValue = ratingIcon.dataset.value;

            try {
                const res = await fetch(`http://localhost:3000/api/movements/${movementId}/rate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({ rating: ratingValue })
                });

                if (res.ok) {
                    const data = await res.json();
                    
                    // Ortalama puanı güvenli bir şekilde güncelle
                    const newAvgRatingText = typeof data.averageRating === 'number'
                        ? data.averageRating.toFixed(1)
                        : 'N/A';
                    card.querySelector('.average-rating').textContent = `Ort: ${newAvgRatingText}`;

                    const dumbbells = card.querySelectorAll('.rating-dumbbell');
                    dumbbells.forEach(icon => {
                        icon.classList.toggle('active', icon.dataset.value <= data.userRating);
                    });
                } else {
                    alert('Puan verilirken bir hata oluştu.');
                }
            } catch (err) {
                console.error('Puan verme hatası:', err);
                alert('Bir hata oluştu, lütfen tekrar deneyin.');
            }
        }
    });
    
    // Tarif kartı genişletme butonu
    document.body.addEventListener('click', (e) => {
         const btn = e.target.closest(".expand-btn");
         if(btn) {
            const card = btn.closest(".recipe-card");
            card.classList.toggle("active");
            btn.innerText = card.classList.contains("active") ? "Tarifi Kapat" : "Tarifi Gör";
         }
    });

    // İlk yükleme
    fetchAndRenderFavoriteRecipes();
    fetchAndRenderFavoriteMovements();
}); 