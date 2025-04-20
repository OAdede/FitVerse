
document.getElementById("calorie-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const gender = document.getElementById("gender").value;
  const age = parseInt(document.getElementById("age").value);
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const activity = parseFloat(document.getElementById("activity").value);
  const resultBox = document.getElementById("calorie-result");

  if (!age || !height || !weight || !activity) {
    resultBox.innerHTML = "<p>Lütfen tüm alanları doğru girin.</p>";
    resultBox.style.display = "block";
    return;
  }

  // Mifflin-St Jeor formülü
  let bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = Math.round(bmr * activity);

  resultBox.innerHTML = `
    <p>Bazal Metabolizma Hızın (BMR): <strong>${Math.round(bmr)} kcal</strong></p>
    <p>Günlük Kalori İhtiyacın (TDEE): <strong>${tdee} kcal</strong></p>
    <p>Bu değer, kilonu korumak için gereken ortalama kaloridir. Hedefin kilo almaksa üzerine, vermekse altına inebilirsin.</p>
  `;
  resultBox.style.display = "block";
});
