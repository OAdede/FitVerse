
document.addEventListener('submit', async function (e) {
    if (e.target.id !== 'bodyfat-form') return;
    
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert('Hesaplama yapmak için lütfen giriş yapın.');
        window.location.href = 'login.html';
        return;
    }

    const resultBox = document.getElementById("bodyfat-result");

    const formData = {
        gender: document.getElementById('gender').value,
        height: parseFloat(document.getElementById('height').value),
        weight: parseFloat(document.getElementById('weight').value),
        waist: parseFloat(document.getElementById('waist').value),
        neck: parseFloat(document.getElementById('neck').value),
        hip: parseFloat(document.getElementById('hip')?.value) || 0 // Hip kadınlar için gerekli
    };

    if (!formData.gender || !formData.height || !formData.weight || !formData.waist || !formData.neck || (formData.gender === 'female' && !formData.hip)) {
        resultBox.innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
        resultBox.style.display = "block";
        return;
    }

    try {
        const res = await fetch('https://fitverse-backend-ea3y.onrender.com/api/calculations/bodyfat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (res.ok) {
            resultBox.innerHTML = `<p>Vücut Yağ Oranın: <strong>%${data.bodyFat}</strong></p>`;
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

// Cinsiyet seçimine göre kalça input'unu göster/gizle
document.getElementById('gender')?.addEventListener('change', function(e) {
    const hipInput = document.getElementById('hip-group');
    if (e.target.value === 'female') {
        hipInput.style.display = 'block';
    } else {
        hipInput.style.display = 'none';
    }
});
