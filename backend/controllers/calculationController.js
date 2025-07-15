const CalculationHistory = require('../models/CalculationHistory');

// @desc    Calculate Body Mass Index (BMI)
// @route   POST /api/calculations/bmi
// @access  Private
exports.calculateBmi = async (req, res, next) => {
  try {
    const { height, weight } = req.body;

    if (!height || !weight) {
      return res.status(400).json({ msg: 'Lütfen boy ve kilo değerlerini girin' });
    }

    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    const bmiValue = parseFloat(bmi);

    const newCalculation = new CalculationHistory({
      user: req.user.id,
      type: 'bmi',
      value: bmiValue,
    });
    await newCalculation.save();

    res.json({ bmi: bmiValue });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// @desc    Calculate Body Fat Percentage
// @route   POST /api/calculations/bodyfat
// @access  Private
exports.calculateBodyFat = async (req, res, next) => {
  try {
    const { gender, height, weight, waist, hip, neck } = req.body;

    if (!gender || !height || !weight || !waist || !neck) {
      return res.status(400).json({ msg: 'Lütfen gerekli tüm alanları doldurun (cinsiyet, boy, kilo, bel, boyun).' });
    }
    
    let bodyFat;
    if (gender === 'male') {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else if (gender === 'female') {
      if (!hip) {
        return res.status(400).json({ msg: 'Kadınlar için kalça ölçüsü gereklidir.' });
      }
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    } else {
      return res.status(400).json({ msg: 'Geçersiz cinsiyet değeri.' });
    }
    
    const bodyFatValue = parseFloat(bodyFat.toFixed(2));

    const newCalculation = new CalculationHistory({
        user: req.user.id,
        type: 'bodyfat',
        value: bodyFatValue
    });
    await newCalculation.save();

    res.json({ bodyFat: bodyFatValue });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// @desc    Calculate Daily Calorie Needs
// @route   POST /api/calculations/calories
// @access  Private
exports.calculateCalories = async (req, res, next) => {
  try {
    const { gender, height, weight, age, activityLevel } = req.body;

    if(!gender || !height || !weight || !age || !activityLevel){
      return res.status(400).json({ msg: 'Lütfen tüm alanları doldurun.' });
    }

    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else if (gender === 'female') {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    } else {
      return res.status(400).json({ msg: 'Geçersiz cinsiyet değeri.' });
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const multiplier = activityMultipliers[activityLevel];

    if(!multiplier){
      return res.status(400).json({ msg: 'Geçersiz aktivite seviyesi.' });
    }

    const dailyCalories = bmr * multiplier;
    const dailyCaloriesValue = parseFloat(dailyCalories.toFixed(2));

    const newCalculation = new CalculationHistory({
        user: req.user.id,
        type: 'calories',
        value: dailyCaloriesValue
    });
    await newCalculation.save();

    res.json({ dailyCalories: dailyCaloriesValue });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu Hatası');
  }
};

// @desc    Get all calculation history for a user
// @route   GET /api/calculations/history
// @access  Private
exports.getCalculationHistory = async (req, res, next) => {
    try {
        const history = await CalculationHistory.find({ user: req.user.id }).sort({ date: 'asc' });
        res.json(history);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Sunucu Hatası');
    }
}; 