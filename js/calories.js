
document.addEventListener('submit', async function (e) {
    if (e.target.id !== 'calories-form') return;
    
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Hesaplama yapmak için lütfen giriş yapın.');
        window.location.href = 'login.html';
        return;
    }

    const resultBox = document.getElementById("calories-result");

    const formData = {
        gender: document.getElementById('gender').value,
        height: parseFloat(document.getElementById('height').value),
        weight: parseFloat(document.getElementById('weight').value),
        age: parseInt(document.getElementById('age').value),
        activityLevel: document.getElementById('activity-level').value
    };

    if (!formData.gender || !formData.height || !formData.weight || !formData.age || !formData.activityLevel) {
        resultBox.innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
        resultBox.style.display = "block";
        return;
    }

    try {
        const res = await fetch('https://fitverse-backend-ea3y.onrender.com/api/calculations/calories', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token 
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
            resultBox.innerHTML = `<p>Günlük Kalori İhtiyacın: <strong>${data.dailyCalories} kcal</strong></p>`;
            resultBox.style.display = 'block';
        } else {
            resultBox.innerHTML = `<p>Hata: ${data.msg || 'Bir sorun oluştu.'}</p>`;
            resultBox.style.display = "block";
        }
    } catch (err) {
        console.error(err);
        resultBox.innerHTML = `<p>Sunucuya bağlanırken bir hata oluştu.</p>`;
        resultBox.style.display = "block";
    }
});
