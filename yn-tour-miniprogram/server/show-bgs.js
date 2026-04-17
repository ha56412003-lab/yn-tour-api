const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yn_tour').then(async () => {
  const Background = require('./models/Background');
  const bgs = await Background.find();
  console.log('Total backgrounds:', bgs.length);
  bgs.forEach(bg => console.log(' -', bg.url, '| status:', bg.status));
  process.exit();
}).catch(e => console.error(e));
