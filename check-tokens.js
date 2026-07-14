const mongoose = require('./backend/node_modules/mongoose');
require('dotenv').config({path:'./backend/.env'});

mongoose.connect(process.env.MONGO_URL).then(async () => {
  const User = require('./backend/src/models/User');
  const users = await User.find({ fcmTokens: { $exists: true, $not: { $size: 0 } } }).select('email fcmTokens');
  
  if (users.length === 0) {
    console.log('❌ No users have FCM tokens saved in DB');
  } else {
    users.forEach(u => {
      console.log(`✅ ${u.email} — tokens: ${u.fcmTokens.length}`);
      u.fcmTokens.forEach((t, i) => console.log(`   token[${i}]: ${t.substring(0,40)}...`));
    });
  }
  mongoose.disconnect();
}).catch(e => {
  console.log('DB Error:', e.message);
  console.log('This connects to local DB - Render DB is different');
  process.exit(1);
});
