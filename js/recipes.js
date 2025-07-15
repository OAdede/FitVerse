
document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.querySelector('.card-container');
    const filterButtons = document.querySelectorAll('.filter-buttons button');
    let currentUserId = null;

    // JWT'yi ayrıştırıp kullanıcı ID'sini alan yardımcı fonksiyon
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken) {
            currentUserId = decodedToken.user.id;
        }
    }

    const handleUrlHash = () => {
        // A small delay to ensure the DOM is fully painted after render
        setTimeout(() => {
            const hash = window.location.hash;
            if (hash) {
                const recipeId = hash.substring(1); // '#' karakterini kaldır
                const recipeCard = document.querySelector(`.recipe-card[data-id="${recipeId}"]`);

                if (recipeCard) {
                    // Kartın görünür olduğundan emin olmak için filtreleri sıfırla
                    document.querySelector(".filter-buttons .active")?.classList.remove("active");
                    document.querySelector(".filter-buttons button[data-filter='all']")?.classList.add("active");
                    document.querySelectorAll(".recipe-card").forEach(rc => {
                        if (rc.getAttribute('data-id') !== 'suggestion') {
                            rc.style.display = 'flex';
                        }
                    });
                    
                    recipeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Kart zaten açık değilse genişlet
                    if (!recipeCard.classList.contains('active')) {
                        recipeCard.querySelector('.expand-btn')?.click();
                    }
                }
            }
        }, 200); // DOM'un yerleşmesi için kısa bir gecikme
    };
    
    const renderRecipes = (recipes) => {
        // Mevcut statik kartları temizle (öneri formu hariç)
        const existingCards = cardContainer.querySelectorAll('.recipe-card:not([data-id="suggestion"])');
        existingCards.forEach(card => card.remove());

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            recipeCard.setAttribute('data-id', recipe._id);
            recipeCard.setAttribute('data-category', recipe.category);

            // Favori kontrolü
            const isFavorited = currentUserId && recipe.favoritedBy.includes(currentUserId);

            recipeCard.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" />
                <div class="info">
                    <h3>${recipe.title}</h3>
                    <p>🔋 ${recipe.calories} kcal | ⏱️ ${recipe.duration} dk</p>
                    <p>Malzemeler: ${recipe.ingredients.join(', ')}</p>
                    <button class="expand-btn">Tarifi Gör</button>
                    <div class="recipe-details">
                        <p>${recipe.steps.join('</p><p>')}</p>
                    </div>
                    <div class="comments-section">
                        <div class="comments-list">
                            ${recipe.comments.map(comment => `
                                <div class="comment" data-comment-id="${comment._id}">
                                    <p><strong>${comment.user.name}:</strong> ${comment.text}</p>
                                    ${currentUserId === comment.user._id ? `<button class="delete-comment-btn" data-recipe-id="${recipe._id}" data-comment-id="${comment._id}"><i class="fa-solid fa-trash"></i></button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        <form class="comment-form">
                            <input type="text" placeholder="Yorum ekle..." required />
                            <button type="submit">Gönder</button>
                        </form>
                    </div>
                    <div class="action-buttons">
                        <button class="like-button ${recipe.likes.some(like => like.user === currentUserId) ? 'liked' : ''}"><i class="fa-regular fa-thumbs-up"></i> <span>${recipe.likes.length}</span></button>
                        <button class="dislike-button ${recipe.dislikes && recipe.dislikes.some(dislike => dislike.user === currentUserId) ? 'disliked' : ''}"><i class="fa-regular fa-thumbs-down"></i> <span>${recipe.dislikes ? recipe.dislikes.length : 0}</span></button>
                        <button class="favorite-button ${isFavorited ? 'favorited' : ''}"><i class="fa-regular fa-star"></i></button>
                        <button class="comment-button"><i class="fa-regular fa-comment"></i></button>
                        <button class="share-button"><i class="fa-solid fa-share-nodes"></i></button>
                    </div>
                </div>
            `;
            // Yeni kartı öneri formundan önce ekle
            const suggestionCard = document.querySelector('.recipe-card[data-id="suggestion"]');
            cardContainer.insertBefore(recipeCard, suggestionCard);
        });

        // Olay dinleyicilerini yeniden bağla
        addCardEventListeners();
        // Sayfa yüklendiğinde URL hash'ini kontrol et
        handleUrlHash();
    };

    const fetchRecipes = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/recipes');
            if (!res.ok) {
                throw new Error('Tarifler yüklenemedi');
            }
            const recipes = await res.json();
            renderRecipes(recipes);
        } catch (error) {
            console.error(error);
            cardContainer.innerHTML = '<p>Tarifler yüklenirken bir hata oluştu.</p>';
        }
    };
    
    const addCardEventListeners = () => {
        const cards = document.querySelectorAll(".recipe-card:not([data-id='suggestion'])");
        cards.forEach(card => {
            const btn = card.querySelector(".expand-btn");
            btn?.addEventListener("click", () => {
                const isActive = card.classList.contains("active");
                // Diğer tüm kartları kapat
                document.querySelectorAll(".recipe-card.active").forEach(c => {
                    if (c !== card) {
                        c.classList.remove("active");
                        c.querySelector(".expand-btn").innerText = "Tarifi Gör";
                    }
                });
                // Tıklanan kartı aç/kapat
                card.classList.toggle("active");
                btn.innerText = isActive ? "Tarifi Gör" : "Tarifi Kapat";
            });

            // Beğenme butonu için olay dinleyici
            const likeButton = card.querySelector('.like-button');
            const dislikeButton = card.querySelector('.dislike-button');
            const favoriteButton = card.querySelector('.favorite-button');

            const updateButtons = (likes, dislikes) => {
                likeButton.querySelector('span').textContent = likes.length;
                dislikeButton.querySelector('span').textContent = dislikes.length;

                const isLiked = likes.some(like => like.user === currentUserId);
                const isDisliked = dislikes.some(dislike => dislike.user === currentUserId);

                likeButton.classList.toggle('liked', isLiked);
                dislikeButton.classList.toggle('disliked', isDisliked);
            };
            
            likeButton?.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Beğeni yapmak için lütfen giriş yapın.');
                    return;
                }

                const recipeId = card.getAttribute('data-id');
                try {
                    const res = await fetch(`http://localhost:3000/api/recipes/${recipeId}/like`, {
                        method: 'PUT',
                        headers: {
                            'x-auth-token': token,
                        },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        updateButtons(data.likes, data.dislikes);
                    } else {
                        const errorData = await res.json();
                        alert(`Hata: ${errorData.msg || 'İşlem gerçekleştirilemedi.'}`);
                    }
                } catch (error) {
                    console.error('Beğenme hatası:', error);
                }
            });

            dislikeButton?.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('İşlem yapmak için lütfen giriş yapın.');
                    return;
                }

                const recipeId = card.getAttribute('data-id');
                try {
                    const res = await fetch(`http://localhost:3000/api/recipes/${recipeId}/dislike`, {
                        method: 'PUT',
                        headers: {
                            'x-auth-token': token,
                        },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        updateButtons(data.likes, data.dislikes);
                    } else {
                        const errorData = await res.json();
                        alert(`Hata: ${errorData.msg || 'İşlem gerçekleştirilemedi.'}`);
                    }
                } catch (error) {
                    console.error('Beğenmeme hatası:', error);
                }
            });

            favoriteButton?.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Bir tarifi favorilere eklemek için lütfen giriş yapın.');
                    return;
                }

                const recipeId = card.getAttribute('data-id');
                try {
                    const res = await fetch(`http://localhost:3000/api/recipes/${recipeId}/favorite`, {
                        method: 'PUT',
                        headers: { 'x-auth-token': token },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        favoriteButton.classList.toggle('favorited', data.isFavorited);
                    } else {
                        const errorData = await res.json();
                        alert(`Hata: ${errorData.msg || 'İşlem gerçekleştirilemedi.'}`);
                    }
                } catch (error) {
                    console.error('Favori hatası:', error);
                }
            });

            // Yorum butonu ve formu için olay dinleyicileri
            const commentButton = card.querySelector('.comment-button');
            const commentsSection = card.querySelector('.comments-section');

            commentButton?.addEventListener('click', () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Yorum yapmak veya görmek için lütfen giriş yapın.');
                    return;
                }
                commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
            });

            // Yorum silme butonu için olay dinleyici
            card.querySelectorAll('.delete-comment-btn').forEach(button => {
                button.addEventListener('click', async (e) => {
                    e.stopPropagation(); // Diğer card eventlerini tetiklemesin
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('Yorum silmek için giriş yapmalısınız.');
                        return;
                    }
            
                    const recipeId = button.dataset.recipeId;
                    const commentId = button.dataset.commentId;
            
                    if (confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
                        try {
                            const res = await fetch(`http://localhost:3000/api/recipes/${recipeId}/comments/${commentId}`, {
                                method: 'DELETE',
                                headers: {
                                    'x-auth-token': token
                                }
                            });
            
                            if (res.ok) {
                                // Yorumu DOM'dan kaldır
                                const commentElement = card.querySelector(`.comment[data-comment-id="${commentId}"]`);
                                commentElement?.remove();
                            } else {
                                const errorData = await res.json();
                                alert(`Hata: ${errorData.msg || 'Yorum silinemedi.'}`);
                            }
                        } catch (error) {
                            console.error('Yorum silme hatası:', error);
                            alert('Yorum silinirken bir hata oluştu.');
                        }
                    }
                });
            });

            // Yorum gönderme formu için olay dinleyici
            const commentForm = card.querySelector('.comment-form');
            commentForm?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = commentForm.querySelector('input');
                const text = input.value.trim();
                
                if (!text) return;

                const token = localStorage.getItem('token');
                const recipeId = card.getAttribute('data-id');

                try {
                    const res = await fetch(`http://localhost:3000/api/recipes/${recipeId}/comment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': token,
                        },
                        body: JSON.stringify({ text }),
                    });

                    if (res.ok) {
                        const newComment = await res.json();
                        const commentsList = card.querySelector('.comments-list');
                        const commentDiv = document.createElement('div');
                        commentDiv.className = 'comment';
                        commentDiv.setAttribute('data-comment-id', newComment._id); // Yeni yorumun ID'sini ekleyin
                        commentDiv.innerHTML = `<p><strong>${newComment.user.name}:</strong> ${newComment.text}</p>`;
                        commentsList.appendChild(commentDiv);
                        input.value = ''; // Input'u temizle
                    } else {
                        alert('Yorum eklenirken bir hata oluştu.');
                    }
                } catch (error) {
                    console.error('Yorum gönderme hatası:', error);
                }
            });
            
            // Paylaş butonu için olay dinleyici
            const shareButton = card.querySelector('.share-button');
            shareButton?.addEventListener('click', async () => {
                const recipeId = card.getAttribute('data-id');
                const title = card.querySelector('h3').innerText;
                const text = `FitVerse'deki bu harika tarife göz atın: ${title}`;
                const baseUrl = window.location.href.split('#')[0];
                const url = `${baseUrl}#${recipeId}`;

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: title,
                            text: text,
                            url: url,
                        });
                        console.log('Tarif başarıyla paylaşıldı!');
                    } catch (error) {
                        console.error('Paylaşım sırasında hata oluştu:', error);
                    }
                } else {
                    // Fallback: Tarayıcı paylaşım API'sini desteklemiyorsa
                    alert('Tarayıcınız bu özelliği desteklemiyor. Linki manuel olarak kopyalayabilirsiniz.');
                }
            });
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            document.querySelector(".filter-buttons .active")?.classList.remove("active");
            button.classList.add("active");

            const filter = button.getAttribute("data-filter");
            const recipeCards = document.querySelectorAll(".recipe-card");
            recipeCards.forEach(card => {
                // Öneri kartını her zaman göster
                if (card.getAttribute('data-id') === 'suggestion') {
                    card.style.display = 'block';
                    return;
                }
                const category = card.getAttribute("data-category");
                card.style.display = (filter === "all" || category === filter) ? "flex" : "none";
            });
        });
    });

    // Başlangıçta tarifleri yükle
    fetchRecipes();

    // Tarif Öneri Formu
    const suggestForm = document.getElementById('suggest-form');
    suggestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('suggest-title').value;
        const ingredients = document.getElementById('suggest-ingredients').value;
        const steps = document.getElementById('suggest-steps').value;
        const submitButton = suggestForm.querySelector('button[type="submit"]');

        // Giriş yapmış kullanıcının e-postasını al
        let userEmail = null;
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = parseJwt(token);
            if(decodedToken && decodedToken.user) {
                // Bu kısım backend'den alınacak gerçek e-postaya göre güncellenebilir.
                // Şimdilik token'dan sadece ID'yi alabiliyoruz, bu yüzden bir placeholder kullanabiliriz
                // veya backend'den /api/profile/me çağrısı yapabiliriz.
                // En basit yol, backend'in bu bilgiyi zaten bilmesi.
                // Biz yine de gönderelim, contactController'a eklemiştim.
                const profileRes = await fetch('http://localhost:3000/api/profile/me', { headers: { 'x-auth-token': token } });
                if(profileRes.ok) {
                    const profile = await profileRes.json();
                    userEmail = profile.user.email;
                }
            }
        }
        
        const originalButtonText = submitButton.innerText;
        submitButton.innerText = 'Gönderiliyor...';
        submitButton.disabled = true;

        try {
            const res = await fetch('http://localhost:3000/api/contact/suggest-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, ingredients, steps, userEmail }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Tarif öneriniz başarıyla gönderildi!');
                suggestForm.reset(); // Formu temizle
            } else {
                alert(`Hata: ${data.error || 'Bir sorun oluştu.'}`);
            }
        } catch (error) {
            console.error('Tarif önerme hatası:', error);
            alert('Öneriniz gönderilirken bir hata oluştu. Sunucunun çalıştığından emin olun.');
        } finally {
            submitButton.innerText = originalButtonText;
            submitButton.disabled = false;
        }
    });
});
