
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '../html/login.html';
    return;
  }

  const API_URL = 'https://fitverse-backend-ea3y.onrender.com/api';
  const headers = {
    'Content-Type': 'application/json',
    'x-auth-token': token,
  };

  const initializeStatusPage = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/me`, { headers });
      if (!res.ok) {
        throw new Error('Profil verisi alınamadı.');
      }
      const profile = await res.json();
      
      // -- Kullanıcı Bilgilerini Doldur --
      document.getElementById('status-name').textContent = profile.user.name || '-';
      document.getElementById('status-height').textContent = profile.height ? `${profile.height} cm` : '-';
      document.getElementById('status-weight').textContent = profile.weight ? `${profile.weight} kg` : '-';
      document.getElementById('status-waist').textContent = profile.waist ? `${profile.waist} cm` : '-';
      document.getElementById('status-neck').textContent = profile.neck ? `${profile.neck} cm` : '-';

      // -- Kilo Takip Grafiğini Çiz --
      if (profile.weightHistory && profile.weightHistory.length > 1) {
        const weightLabels = profile.weightHistory.map(item => new Date(item.date).toLocaleDateString('tr-TR'));
        const weightData = profile.weightHistory.map(item => item.weight);

        const weightCtx = document.getElementById('weightChart').getContext('2d');
        new Chart(weightCtx, {
          type: 'line',
          data: {
            labels: weightLabels,
            datasets: [{
              label: 'Kilo (kg)',
              data: weightData,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: false }
            }
          }
        });
      } else {
        const weightChartContainer = document.getElementById('weightChart').parentElement;
        weightChartContainer.innerHTML = '<h3>Kilo Takip Grafiği</h3><p>Grafiği görüntülemek için en az iki farklı kilo kaydınız olmalıdır.</p>';
      }

      // -- Yağ Oranı Geçmişi ve Grafiği (Mevcut yapı korunuyor) --
      fetchHistoryAndRenderFatChart();

    } catch (error) {
      console.error('Profil ve kilo verileri yüklenirken hata:', error);
      // Hata durumunda kullanıcıyı bilgilendir
    }
  };

  const fetchHistoryAndRenderFatChart = async () => {
    try {
      const res = await fetch(`${API_URL}/calculations/history`, { headers });
      if (!res.ok) {
        throw new Error('Hesaplama geçmişi alınamadı.');
      }
      const history = await res.json();

      const bodyFatHistory = history.filter(item => item.type === 'bodyfat');
      
      if (bodyFatHistory.length > 0) {
        const labels = bodyFatHistory.map(item => new Date(item.date).toLocaleDateString('tr-TR'));
        const data = bodyFatHistory.map(item => item.value);

        document.getElementById('status-bodyfat').textContent = data.length > 0 ? `%${data[data.length - 1]}`: '-';

        const fatCtx = document.getElementById('fatChart').getContext('2d');
        new Chart(fatCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Yağ Oranı (%)',
              data: data,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: false }
            }
          }
        });
      } else {
         const fatChartContainer = document.getElementById('fatChart').parentElement;
         fatChartContainer.innerHTML = '<h3>Yağ Oranı Değişimi</h3><p>Grafiği görüntülemek için henüz yeterli yağ oranı veriniz yok.</p>';
      }
    } catch (error) {
      console.error('Yağ oranı geçmişi yüklenirken hata:', error);
    }
  };

  initializeStatusPage();
});


