document.addEventListener('DOMContentLoaded', async () => {
    const videoCardsContainer = document.getElementById('video-cards-container');
    const titleElement = document.getElementById('muscle-group-title');
    const token = localStorage.getItem('token');
    let userFavorites = [];
    let userProfile = null;

    // URL'den kategori adını al (örn: "chest.html" -> "chest")
    const path = window.location.pathname;
    const page = path.split("/").pop();
    const category = page.replace('.html', '');

    if (!videoCardsContainer) {
        console.error('Video card container not found!');
        return;
    }

    // Kullanıcının favorilerini al
    if (token) {
        try {
            const res = await fetch('http://localhost:3000/api/profile/me', {
                headers: { 'x-auth-token': token }
            });
            if (res.ok) {
                const profile = await res.json();
                userProfile = profile.user; // Kullanıcı profilini sakla
                if (userProfile && userProfile.favoriteMovements) {
                    userFavorites = userProfile.favoriteMovements;
                }
            }
        } catch (err) {
            console.error('Failed to fetch user favorites:', err);
        }
    }
    
    // Kategoriye göre hareketleri çek ve render et
    try {
        const res = await fetch(`http://localhost:3000/api/movements/${category}`);
        const movements = await res.json();

        if (movements.length === 0) {
            videoCardsContainer.innerHTML = '<p>Bu kategori için henüz hareket eklenmemiş.</p>';
            return;
        }

        // Başlığı güncelle
        if(titleElement) {
            titleElement.textContent = `${category.charAt(0).toUpperCase() + category.slice(1)} Egzersizleri`;
        }
        
        videoCardsContainer.innerHTML = ''; // Temizle
        movements.forEach(movement => {
            // Favori kontrolünü string'e çevirerek daha güvenli yapalım
            const isFavorited = userFavorites.map(String).includes(String(movement._id));
            
            // Kullanıcının bu hareketi beğenip beğenmediğini kontrol et
            const userLiked = userProfile && movement.likes.includes(userProfile._id);
            const userDisliked = userProfile && movement.dislikes.includes(userProfile._id);
            
            // Kullanıcının bu harekete verdiği puanı bul
            let userRating = 0;
            if (userProfile && movement.ratings) {
                const ratingObj = movement.ratings.find(r => r.user === userProfile._id);
                if (ratingObj) {
                    userRating = ratingObj.rating;
                }
            }

            const card = document.createElement('div');
            card.className = 'video-card';
            card.setAttribute('data-id', movement._id);
            card.innerHTML = `
                <iframe src="${movement.youtubeUrl}" allowfullscreen></iframe>
                <div class="title">${movement.name}</div>
                <div class="rating-section" data-id="${movement._id}">
                    <div class="rating-stars">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <i class="fa-solid fa-dumbbell rating-dumbbell ${i <= userRating ? 'active' : ''}" data-value="${i}"></i>
                        `).join('')}
                    </div>
                    <span class="average-rating">Ort: ${movement.averageRating || 'N/A'}</span>
                </div>
                <p class="description">${movement.description}</p>
                <div class="action-buttons">
                    <div class="like-dislike-container">
                        <button class="like-button ${userLiked ? 'liked' : ''}" data-id="${movement._id}" data-action="like">
                            <i class="fa-solid fa-thumbs-up"></i>
                            <span class="like-count">${movement.likes.length}</span>
                        </button>
                        <button class="dislike-button ${userDisliked ? 'disliked' : ''}" data-id="${movement._id}" data-action="dislike">
                            <i class="fa-solid fa-thumbs-down"></i>
                            <span class="dislike-count">${movement.dislikes.length}</span>
                        </button>
                    </div>
                    <div class="fav-share-container">
                        <button class="favorite-button ${isFavorited ? 'favorited' : ''}" data-id="${movement._id}">
                            <i class="fa-solid fa-star"></i>
                        </button>
                        <button class="share-button" data-title="${movement.name}" data-url="${window.location.href}#${movement._id}">
                            <i class="fa-solid fa-share-nodes"></i>
                        </button>
                    </div>
                </div>
            `;
            videoCardsContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Hareketler yüklenirken hata:', error);
        videoCardsContainer.innerHTML = '<p>Hareketler yüklenirken bir hata oluştu.</p>';
    }

    // Event Delegation for action buttons
    videoCardsContainer.addEventListener('click', async (e) => {
        const token = localStorage.getItem('token');
        // Tıklanan elementin bir buton veya rating ikonu olup olmadığını kontrol et
        const target = e.target;
        const button = target.closest('button');
        const ratingIcon = target.closest('.rating-dumbbell');

        if (button) {
            // Favori, Like, Dislike, Share buton işlemleri burada...
            // Favori butonu işlemleri
            if (button.classList.contains('favorite-button')) {
                if (!token) {
                    alert('Favorilere eklemek için giriş yapmalısınız.');
                    window.location.href = '../html/login.html';
                    return;
                }
                const movementId = button.dataset.id;
                try {
                    const res = await fetch(`http://localhost:3000/api/movements/${movementId}/favorite`, {
                        method: 'POST',
                        headers: { 'x-auth-token': token },
                    });
                    if (res.ok) {
                        button.classList.toggle('favorited');
                    } else {
                        alert('İşlem başarısız oldu.');
                    }
                } catch (err) {
                    console.error('Favori işlemi hatası:', err);
                    alert('Bir hata oluştu, lütfen tekrar deneyin.');
                }
            }

            // Like/Dislike butonu işlemleri
            if (button.classList.contains('like-button') || button.classList.contains('dislike-button')) {
                 if (!token) {
                    alert('Bu işlemi yapmak için giriş yapmalısınız.');
                    window.location.href = '../html/login.html';
                    return;
                }
                const movementId = button.dataset.id;
                const action = button.dataset.action;
                
                try {
                    const res = await fetch(`http://localhost:3000/api/movements/${movementId}/like`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token
                        },
                        body: JSON.stringify({ action })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        // Kart üzerindeki sayıları ve buton stillerini güncelle
                        const card = button.closest('.video-card');
                        card.querySelector('.like-count').textContent = data.likes;
                        card.querySelector('.dislike-count').textContent = data.dislikes;
                        
                        const likeBtn = card.querySelector('.like-button');
                        const dislikeBtn = card.querySelector('.dislike-button');
                        
                        likeBtn.classList.toggle('liked', data.userLiked);
                        dislikeBtn.classList.toggle('disliked', data.userDisliked);

                    } else {
                        alert('İşlem başarısız oldu.');
                    }

                } catch(err) {
                     console.error('Like/Dislike işlemi hatası:', err);
                     alert('Bir hata oluştu, lütfen tekrar deneyin.');
                }
            }

            // Paylaş butonu işlemleri
            if (button.classList.contains('share-button')) {
                const title = button.dataset.title;
                const url = button.dataset.url;
                if (navigator.share) {
                    navigator.share({
                        title: `${title} | FitVerse`,
                        text: `Bu harika FitVerse hareketine göz at: ${title}`,
                        url: url,
                    }).catch(err => console.error('Paylaşma hatası:', err));
                } else {
                    navigator.clipboard.writeText(url).then(() => {
                        alert('Hareket linki panoya kopyalandı!');
                    }).catch(err => {
                        console.error('Pano hatası:', err);
                        alert('Link kopyalanamadı.');
                    });
                }
            }
        }
        
        if (ratingIcon) {
            if (!token) {
                alert('Puan vermek için giriş yapmalısınız.');
                window.location.href = '../html/login.html';
                return;
            }
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
                    
                    // Ortalama puanı güncelle
                    card.querySelector('.average-rating').textContent = `Ort: ${data.averageRating}`;

                    // Dumbbell ikonlarını güncelle
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
}); 