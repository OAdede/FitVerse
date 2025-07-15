
document.getElementById("bmi-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
      alert('Hesaplama yapmak için lütfen giriş yapın.');
      window.location.href = 'login.html';
      return;
  }

  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);
  
  // Sonuç elementleri
  const resultBox = document.getElementById("bmi-result");
  const bmiValueEl = document.getElementById("bmi-value");
  const bmiStatusEl = document.getElementById("bmi-status");
  const bmiCommentEl = document.getElementById("bmi-comment");
  const bmiCommentContainer = document.getElementById("bmi-comment-container");


  if (!height || !weight || height <= 0 || weight <= 0) {
    bmiStatusEl.textContent = "Hata";
    bmiCommentEl.textContent = "Lütfen geçerli boy ve kilo girin.";
    bmiValueEl.textContent = "-";
    resultBox.style.display = "block";
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/calculations/bmi', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ height, weight }),
    });

    const data = await res.json();
    let status = "";
    let recommendation = "";

    if (res.ok) {
        const bmi = data.bmi;
        if (bmi < 18.5) {
            status = "Düşük Kilolu";
        } else if (bmi < 25) {
            status = "Normal Kilolu";
        } else if (bmi < 30) {
            status = "Fazla Kilolu";
        } else {
            status = "Obez";
        }

        switch (status) {
            case "Düşük Kilolu":
                recommendation = "Vücut kitle indeksiniz normalin altında. Sağlıklı bir şekilde kilo almak için bir beslenme uzmanıyla görüşebilir, kalori ve protein açısından zengin gıdalar tüketebilirsiniz. Düzenli kuvvet antrenmanları da kas kütlenizi artırmanıza yardımcı olabilir.";
                break;
            case "Normal Kilolu":
                recommendation = "Tebrikler! Vücut kitle indeksiniz ideal aralıkta. Bu formunuzu korumak için dengeli beslenmeye ve düzenli fiziksel aktiviteye devam etmeniz harika olur. Mevcut yaşam tarzınız sağlığınız için iyi bir temel oluşturuyor.";
                break;
            case "Fazla Kilolu":
                recommendation = "Vücut kitle indeksiniz normalin biraz üzerinde. Daha dengeli bir diyet programı ve düzenli egzersiz (haftada 150 dakika orta yoğunlukta kardiyo gibi) ile ideal kilonuza ulaşabilirsiniz. Küçük yaşam tarzı değişiklikleri büyük farklar yaratabilir.";
                break;
            case "Obez":
                recommendation = "Vücut kitle indeksiniz yüksek. Sağlığınızı korumak adına kilo vermeniz önemlidir. Bir sağlık profesyonelinden veya diyetisyenden destek alarak size özel bir beslenme ve egzersiz planı oluşturmak en doğru başlangıç olacaktır. Unutmayın, atacağınız her sağlıklı adım değerlidir.";
                break;
        }

        bmiValueEl.textContent = bmi;
        bmiStatusEl.textContent = status;
        bmiCommentEl.textContent = recommendation;
        bmiCommentContainer.className = `comment-box ${status.toLowerCase().replace(' ', '-')}`; // Duruma göre CSS class'ı ekle
        resultBox.style.display = "block";

    } else {
        bmiStatusEl.textContent = "Hata";
        bmiCommentEl.textContent = data.msg || 'Bir sorun oluştu.';
        bmiValueEl.textContent = "-";
        resultBox.style.display = "block";
    }
  } catch (err) {
    console.error(err);
    bmiStatusEl.textContent = "Sunucu Hatası";
    bmiCommentEl.textContent = "Sunucuya bağlanırken bir hata oluştu.";
    bmiValueEl.textContent = "-";
    resultBox.style.display = "block";
  }
});
