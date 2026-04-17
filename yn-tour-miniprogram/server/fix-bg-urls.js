const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yn-tour').then(async () => {
  const Background = require('./models/Background');
  const bgs = await Background.find({ url: { $regex: '^/uploads/' } });
  console.log('Found backgrounds to update:', bgs.length);
  for (const bg of bgs) {
    const oldUrl = bg.url;
    bg.url = bg.url.replace('/uploads', '/api/uploads');
    await bg.save();
    console.log(`  ${oldUrl} → ${bg.url}`);
  }
  console.log('Done!');
  process.exit();
}).catch(e => console.error(e));
