const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');


const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB bağlantısı (şifre ve veritabanı adını kendine göre değiştir!)
mongoose.connect('mongodb+srv://admin:admin@cluster0.9apmgon.mongodb.net/ali?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Bağlantısı Başarılı'))
  .catch(err => console.error('❌ MongoDB Bağlantı Hatası:', err));
  const path = require('path');
  app.use('/images', express.static(path.join(__dirname, 'resim')));

  // Oyun şeması
  const UserGameSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    playtime:    { type: Number, default: 0 },
    rating:      { type: Number, default: 0 },
    comment:     { type: String, default: '' },
    commentDate: { type: Date, default: Date.now }
  });
  // Aynı kullanıcı–oyun çifti birden fazla eklenemesin:
  
  const UserGame = mongoose.model('UserGame', UserGameSchema);


// Kullanıcı şeması
const User = mongoose.model('User', {
    email: String,
    password: String,
    library: [String]
});

// Kullanıcı kaydetme endpoint'i
app.post('/addUser', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Eksik bilgi" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Bu e-mail zaten kayıtlı!" });

    const newUser = new User({ email, password });
    await newUser.save();
    res.status(201).json({ message: "Kullanıcı başarıyla kaydedildi" });
});
// Giriş kontrolü
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
  
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı!" });
    }
  
    if (user.password !== password) {
      return res.status(401).json({ message: "Şifre yanlış!" });
    }
  
    res.json({ message: "Giriş başarılı" });
  });
  app.get('/getLibrary', async (req, res) => {
    const email = req.query.email;
    const user = await User.findOne({ email });
  
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
  
    const games = await Game.find({ _id: { $in: user.library } });
    res.json(games);
  });
  const Game = mongoose.model("Game", {
    title: String,
    genre: String,
    description: String,
    image: String,
    rating: { type: Number, default: 0 }
  });
  

  

  
  
  
  // Tüm oyunları ver
  app.get('/games', async (req, res) => {
    const games = await Game.find();
    res.json(games);
  });
  
  // Kullanıcıya oyun ekle
  app.post('/addToLibrary', async (req, res) => {
    const { email, gameId } = req.body;
  
    if (!email || !gameId) {
      return res.status(400).json({ message: "Eksik bilgi" });
    }
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }
  
      if (!user.library) user.library = [];
  
      if (user.library.includes(gameId)) {
        return res.status(409).json({ message: "Bu oyun zaten eklenmiş." });
      }
  
      user.library.push(gameId);
      await user.save();
  
      res.json({ message: "Oyun başarıyla eklendi!" });
    } catch (error) {
      console.error("addToLibrary hatası:", error);
      res.status(500).json({ message: "Sunucu hatası." });
    }
  });
  // oyun kaldırma işlemi
  app.post("/removeFromLibrary", async (req, res) => {
    const { email, gameId } = req.body;
  
    try {
      const result = await User.updateOne(
        { email },
        { $pull: { library: gameId.toString() } }  // 🔁 ObjectId değil → String olarak tut
      );
      const user = await User.findOne({ email });
      if (user) {
        await UserGame.deleteMany({ userId: user._id, gameId });
      }


      if (result.modifiedCount > 0) {
        res.json({ success: true, message: "Oyun kaldırıldı." });
      } else {
        res.json({ success: false, message: "Oyun zaten kütüphanede yok." });
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
    }
  });
  // Add comment endpoint
  // Add comment endpoint — kullanıcı istediği kadar yorum yapabilir, rating için sadece son yorum alınır
app.post('/addComment', async (req, res) => {
  try {
    const { gameId, email, comment, rating } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    // 1) Yeni yorum ekle (her seferinde insert)
    await UserGame.create({
      userId:      user._id,
      gameId:      gameId,
      comment,     comment,
      rating:      parseInt(rating),
      commentDate: new Date()
    });

    // 2) Her kullanıcının sadece son yorumundaki rating’i alıp ortalama hesapla
    const agg = await UserGame.aggregate([
      { 
        $match: { 
          gameId: new mongoose.Types.ObjectId(gameId),
          rating: { $gt: 0 }
        } 
      },
      // yorumları tarihe göre sırala
      { $sort: { commentDate: 1 } },
      // her kullanıcı için son rating’i al
      {
        $group: {
          _id: { userId: '$userId' },
          lastRating: { $last: '$rating' }
        }
      },
      // oyun bazında ortalama al
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$lastRating' }
        }
      }
    ]);
    const avg = agg[0]?.avgRating?.toFixed(1) || 0;

    // 3) Game belgesini güncelle
    await Game.findByIdAndUpdate(gameId, { rating: parseFloat(avg) });

    return res.json({ success: true });
  } catch (err) {
    console.error("addComment hatası:", err);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});

  
  // Get comments endpoint
  app.get('/getComments', async (req, res) => {
    try {
      const { gameId } = req.query;
      const comments = await UserGame.find({gameId})
        .sort({ commentDate: -1 })
        .populate('userId', 'email');
  
      return res.json({
        comments: comments.map(c => ({
          email:   c.userId.email,
          rating:  c.rating,
          comment: c.comment
        }))
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Sunucu hatası." });
    }
  });
  app.get("/getGameById", async (req, res) => {
    const gameId = req.query.gameId;
    try {
      const game = await Game.findById(gameId);
      res.json(game);
    } catch (err) {
      res.status(500).json({ message: "Hata oluştu." });
    }
  });

  // Oyun oynama endpoint’i → playtime’ı +1 arttırır
  app.post('/playGame', async (req, res) => {
    try {
      const { gameId, email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  
      const ug = await UserGame.findOneAndUpdate(
        { userId: user._id, gameId },
        { $inc: { playtime: 1 } },
        { upsert: true, new: true }
      );
      return res.json(ug);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Sunucu hatası." });
    }
  });

  app.get('/userGames', async (req, res) => {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });
  
    // UserGame içinde hem playtime’ı al, hem gameId üzerinden Game dokümanını populate et
    const userGames = await UserGame
      .find({ userId: user._id })
      .populate('gameId', 'title');
  
    res.json(userGames);
  });

  //silme işlemi
app.delete('/deleteUser', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    const userGames = await UserGame.find({ userId: user._id });
    const affectedGameIds = [...new Set(userGames.map(ug => ug.gameId.toString()))];


    // 1) Kullanıcıyı sil
    await User.deleteOne({ _id: user._id });
    // 2) Kullanıcıya ait oyun kayıtlarını sil
    await UserGame.deleteMany({ userId: user._id });

    for (let gameId of affectedGameIds) {
      const agg = await UserGame.aggregate([
        { $match: { gameId: new mongoose.Types.ObjectId(gameId), rating: { $gt: 0 } } },
        { $sort: { commentDate: 1 } },
        { $group: {
            _id: '$userId',
            lastRating: { $last: '$rating' }
        }},
        { $group: {
            _id: null,
            avgRating: { $avg: '$lastRating' }
        }}
      ]);
      const newAvg = agg[0]?.avgRating?.toFixed(1) || 0;
      await Game.findByIdAndUpdate(gameId, { rating: parseFloat(newAvg) });
    }

    return res.json({ message: "Kullanıcı ve ilişkili veriler silindi." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});
  
  


 const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
   console.log(`🚀 Server ${PORT} portunda çalışıyor`);
 });
