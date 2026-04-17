const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yn-tour').then(async () => {
  const User = require('./models/User');
  
  const updates = [
    { id: '69cb5376c6b58347b629a679', nickname: '李明' },
    { id: '69cb5439c6b58347b629a67c', nickname: '张伟' },
    { id: '69cb5439c6b58347b629a67f', nickname: '王芳' },
    { id: '69ddbfe8429a2863c42a992e', nickname: '赵丽' },
    { id: '69ddc6b8b2f97e06243b4966', nickname: '刘洋' },
    { id: '69de2ba7db522b44bb8e9546', nickname: '陈静' },
    { id: '69de2e4beff31649d8b3149f', nickname: '周杰' },
    { id: '69e1ad743a37e89e37596dab', nickname: '吴婷' },
    { id: '69e1ad8b12d36986229f1542', nickname: '郑强' },
    { id: '69e1ad9cda85a61dc535bb2f', nickname: '孙敏' },
    { id: '69e1ad9cda85a61dc535bb32', nickname: '钱文' },
    { id: '69e1adf25958f413885c77eb', nickname: '冯凯' },
    { id: '69e1adf25958f413885c77ee', nickname: '蒋琳' },
  ];
  
  for (const u of updates) {
    await User.findByIdAndUpdate(u.id, { nickname: u.nickname });
    console.log(`Updated: ${u.id} → ${u.nickname}`);
  }
  console.log('Done!');
  process.exit();
}).catch(e => console.error(e));
