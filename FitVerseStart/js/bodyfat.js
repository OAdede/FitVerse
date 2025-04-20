
document.getElementById("gender").addEventListener("change", function () {
  document.getElementById("hip-group").style.display = this.value === "female" ? "block" : "none";
});

document.getElementById("bodyfat-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const gender = document.getElementById("gender").value;
  const height = parseFloat(document.getElementById("height").value);
  const neck = parseFloat(document.getElementById("neck").value);
  const waist = parseFloat(document.getElementById("waist").value);
  const hip = parseFloat(document.getElementById("hip").value);
  const resultBox = document.getElementById("bodyfat-result");

  if (!height || !neck || !waist || (gender === "female" && !hip)) {
    resultBox.innerHTML = "<p>Lütfen tüm alanları doldurun.</p>";
    resultBox.style.display = "block";
    return;
  }

  let bodyFat;
  if (gender === "male") {
    bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
  }

  const fat = bodyFat.toFixed(1);
  let comment = "";

  if (gender === "male") {
    if (fat < 6) comment = "Çok düşük";
    else if (fat <= 13) comment = "Sporcu";
    else if (fat <= 17) comment = "İyi";
    else if (fat <= 24) comment = "Normal";
    else comment = "Yüksek";
  } else {
    if (fat < 14) comment = "Çok düşük";
    else if (fat <= 20) comment = "Sporcu";
    else if (fat <= 24) comment = "İyi";
    else if (fat <= 31) comment = "Normal";
    else comment = "Yüksek";
  }

  resultBox.innerHTML = `
    <p>Vücut Yağ Oranınız: <strong>%${fat}</strong></p>
    <p>Durum: <strong>${comment}</strong></p>
  `;
  resultBox.style.display = "block";
});
