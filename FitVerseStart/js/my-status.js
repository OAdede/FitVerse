
const fatCtx = document.getElementById("fatChart").getContext("2d");
const muscleCtx = document.getElementById("muscleChart").getContext("2d");

new Chart(fatCtx, {
  type: 'line',
  data: {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs'],
    datasets: [{
      label: 'Yağ Oranı (%)',
      data: [20, 19.5, 19, 18.5, 18],
      backgroundColor: 'rgba(138, 170, 229, 0.2)',
      borderColor: '#8AAAE5',
      borderWidth: 2,
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: false, suggestedMin: 10, suggestedMax: 25 }
    }
  }
});

new Chart(muscleCtx, {
  type: 'line',
  data: {
    labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs'],
    datasets: [{
      label: 'Kas Oranı (%)',
      data: [36, 37.2, 38.1, 39.1, 40],
      backgroundColor: 'rgba(129, 199, 132, 0.2)',
      borderColor: 'rgba(76,175,80,1)',
      borderWidth: 2,
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: false, suggestedMin: 30, suggestedMax: 50 }
    }
  }
});


