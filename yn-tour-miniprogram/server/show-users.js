const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yn-tour').then(async () => {
  const User = require('./models/User');
  const users = await User.find({ isDistributor: true }).select('_id nickname totalEarnings availableBalance');
  console.log('Distributor users:');
  users.forEach(u => console.log(`  ${u._id}: "${u.nickname}" | earnings: ${u.totalEarnings} | available: ${u.availableBalance}`));
  process.exit();
}).catch(e => console.error(e));
