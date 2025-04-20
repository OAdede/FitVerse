
document.getElementById("bmi-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const height = parseFloat(document.getElementById("height").value) / 100;
  const weight = parseFloat(document.getElementById("weight").value);
  const resultBox = document.getElementById("bmi-result");

  if (!height || !weight || height <= 0 || weight <= 0) {
    resultBox.innerHTML = "<p>Lütfen geçerli boy ve kilo girin.</p>";
    resultBox.style.display = "block";
    return;
  }

  const bmi = (weight / (height * height)).toFixed(1);
  let comment = "";

  if (bmi < 18.5) comment = "Düşük kilolu";
  else if (bmi < 25) comment = "Normal kilolu";
  else if (bmi < 30) comment = "Fazla kilolu";
  else comment = "Obez";

  resultBox.innerHTML = `
    <p>BMI Değerin: <strong>${bmi}</strong></p>
    <p>Durum: <strong>${comment}</strong></p>
  `;
  resultBox.style.display = "block";
});
