/**
 * 迁移脚本：将 Review 图片从 base64 转换为文件存储
 * 运行一次即可
 */
const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const Review = require('./models/Review');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads', 'reviews');

// 确保上传目录存在
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function migrateImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const reviews = await Review.find({});
  console.log(`Found ${reviews.length} reviews`);

  let migrated = 0;
  let skipped = 0;

  for (const review of reviews) {
    if (review.image && review.image.startsWith('data:')) {
      try {
        // 提取 base64 数据
        const matches = review.image.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          console.log(`Review ${review._id}: invalid base64 format, skipping`);
          skipped++;
          continue;
        }

        const mimeType = matches[1]; // e.g., 'image/jpeg'
        const base64Data = matches[2];

        // 生成文件名
        const ext = mimeType.split('/')[1] || 'jpg';
        const filename = `review_${review._id}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // 写入文件
        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
        console.log(`Review ${review._id}: saved to ${filename}`);

        // 更新数据库
        review.image = `/uploads/reviews/${filename}`;
        await review.save();

        migrated++;
      } catch (err) {
        console.error(`Review ${review._id}: error - ${err.message}`);
        skipped++;
      }
    } else {
      console.log(`Review ${review._id}: no base64 image, skipping`);
      skipped++;
    }
  }

  console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped`);
  await mongoose.disconnect();
}

migrateImages().catch(console.error);
