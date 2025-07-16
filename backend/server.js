const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const Recipe = require('./models/Recipe'); // Recipe modelini import et
const Movement = require('./models/Movement'); // Movement modelini import et
const { connectRabbitMQ } = require('./utils/rabbitmq'); // RabbitMQ bağlantı fonksiyonunu import et

// Load env vars
dotenv.config(); // CORRECTED: Use default path, which is correct when running from `backend` folder.

connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json()); // Add this line to parse JSON bodies

// Enable CORS
app.use(cors());

// Statik dosyaları sunmak için middleware (HTML, CSS, JS, Resimler vb.)
// Bu, backend klasöründen bir üst dizine çıkarak projenin kökünü hedefler.
app.use(express.static(path.join(__dirname, '..')));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Init Middleware
// app.use(express.json({ extended: false })); // This line is now redundant as express.json() is used globally

// Geçici Veri Ekleme Fonksiyonu
const seedDatabase = async () => {
  try {
    const recipeCount = await Recipe.countDocuments();
    if (recipeCount === 0) {
      console.log('Veritabanında tarif bulunamadı, başlangıç verileri ekleniyor...');
      const initialRecipes = [
        {
          title: 'Tavuk Göğsü Izgara',
          ingredients: ['Tavuk', 'Zeytinyağı', 'Baharat'],
          steps: ['Tavuk göğsünü şeritler hâlinde kes.', 'Zeytinyağı, sarımsak ve baharatlarla marine et.', 'Izgarada 6 dakika pişir.'],
          image: '../img/tavukgogusu.jpg',
          category: 'protein',
          calories: 320,
          duration: 25,
        },
        {
            title: 'Avokadolu Yumurta',
            ingredients: ['Yumurta', 'Avokado', 'Pul biber'],
            steps: ['Yumurtayı haşla.', 'Avokadoyu ez, tuz ve limon ekle.', 'Yumurtayı üzerine koy, pul biberle süsle.'],
            image: '../img/avakado.jpg',
            category: 'lowcarb',
            calories: 240,
            duration: 10,
        },
        {
            title: 'Yoğurtlu Smoothie',
            ingredients: ['Yoğurt', 'Yaban mersini', 'Chia'],
            steps: ['Yoğurt, meyve ve chia tohumunu blenderda karıştır.', 'Nane ile süsle.'],
            image: '../img/yogurt.jpg',
            category: 'protein',
            calories: 150,
            duration: 5,
        }
      ];
      await Recipe.insertMany(initialRecipes);
      console.log('Başlangıç tarifleri başarıyla eklendi.');
    }
  } catch (error) {
    console.error('Veritabanı seeding hatası:', error);
  }
};

const seedMovements = async () => {
  try {
    const movementCount = await Movement.countDocuments();
    if (movementCount === 0) {
      console.log('Veritabanında hareket bulunamadı, başlangıç verileri ekleniyor...');
      const initialMovements = [
        // Chest
        { name: 'Bench Press', category: 'chest', youtubeUrl: 'https://www.youtube.com/embed/vcBig73ojpE', description: 'Göğüs kaslarını hedef alan temel bir itiş egzersizidir.' },
        { name: 'Incline Dumbbell Press', category: 'chest', youtubeUrl: 'https://www.youtube.com/embed/8iPEnn-ltC8', description: 'Göğüsün üst kısmını hedef alan etkili bir egzersizdir.' },
        { name: 'Push-Up (Şınav)', category: 'chest', youtubeUrl: 'https://www.youtube.com/embed/IODxDxX7oi4', description: 'Vücut ağırlığı ile yapılan temel bir göğüs egzersizidir.' },
        // Biceps
        { name: 'Barbell Curl', category: 'biceps', youtubeUrl: 'https://www.youtube.com/embed/kwG2Z2_vX_c', description: 'Biceps kaslarını izole eden temel bir kaldırma hareketidir.' },
        { name: 'Dumbbell Hammer Curl', category: 'biceps', youtubeUrl: 'https://www.youtube.com/embed/zC3nLlEvin4', description: 'Biceps ve ön kol kaslarını çalıştıran bir varyasyondur.' },
        // Triceps
        { name: 'Tricep Dips', category: 'triceps', youtubeUrl: 'https://www.youtube.com/embed/0326dy_-CzM', description: 'Vücut ağırlığı ile tricepsleri hedef alan etkili bir egzersiz.' },
        { name: 'Skull Crushers', category: 'triceps', youtubeUrl: 'https://www.youtube.com/embed/d_KZxkY_0cM', description: 'Yatarak yapılan ve tricepsleri izole eden bir harekettir.' },
        // Shoulders
        { name: 'Overhead Press', category: 'shoulders', youtubeUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI', description: 'Omuz kaslarını güçlendiren temel bir itiş egzersizidir.' },
        { name: 'Lateral Raises', category: 'shoulders', youtubeUrl: 'https://www.youtube.com/embed/3VcKaXpzqRo', description: 'Omuzların yan kısımlarını hedef alan bir izolasyon hareketidir.' },
        // Abs
        { name: 'Crunches', category: 'abs', youtubeUrl: 'https://www.youtube.com/embed/Xyd_fa5zoEU', description: 'Karın kaslarını hedef alan klasik bir egzersizdir.' },
        { name: 'Plank', category: 'abs', youtubeUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c', description: 'Tüm karın bölgesini ve merkez gücünü çalıştıran izometrik bir duruştur.' },
        // Back
        { name: 'Pull-Ups', category: 'back', youtubeUrl: 'https://www.youtube.com/embed/eGo4E9VtLdU', description: 'Sırt ve kanat kaslarını hedef alan zorlu bir vücut ağırlığı egzersizidir.' },
        { name: 'Bent Over Rows', category: 'back', youtubeUrl: 'https://www.youtube.com/embed/vT2GjY_Umpw', description: 'Sırtın orta kısmını ve kanatları çalıştıran temel bir çekiş hareketidir.' },
        // Legs (Genel)
        { name: 'Squat', category: 'quads', youtubeUrl: 'https://www.youtube.com/embed/bEv6CCg2BC8', description: 'Bacak ve kalça kaslarını çalıştıran temel bir egzersizdir.' },
        { name: 'Deadlift', category: 'hamstring', youtubeUrl: 'https://www.youtube.com/embed/ytGaGIn3SjE', description: 'Tüm vücudu, özellikle arka bacak ve sırtı çalıştıran bir kaldırma hareketidir.' },
        { name: 'Lunges', category: 'glutes', youtubeUrl: 'https://www.youtube.com/embed/QOVaHwm-Q6U', description: 'Tek bacakla yapılan ve dengeyi geliştiren bir bacak egzersizidir.' },
        { name: 'Calf Raises', category: 'calves', youtubeUrl: 'https://www.youtube.com/embed/JbyjNymZOtU', description: 'Baldır kaslarını izole eden ve güçlendiren bir harekettir.' }
      ];
      await Movement.insertMany(initialMovements);
      console.log('Başlangıç hareketleri başarıyla eklendi.');
    }
  } catch (error) {
    console.error('Hareketleri eklerken hata:', error);
  }
};

app.get('/', (req, res) => {
  res.send('Backend sunucusu çalışıyor!');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/calculations', require('./routes/calculations'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/movements', require('./routes/movements')); 
app.use('/api/worker', require('./routes/worker')); // Yeni worker rotasını ekle

// Server'ı dinle
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectRabbitMQ();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        seedDatabase(); // Sunucu başlayınca tarif veritabanını kontrol et ve doldur
        seedMovements(); // Sunucu başlayınca hareket veritabanını kontrol et ve doldur
    });
};

startServer(); 