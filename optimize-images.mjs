import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

async function optimizeImages() {
  console.log('Finding PNG files to optimize...');

  // Find all PNG files except in node_modules
  const files = await glob('**/*.png', {
    ignore: ['node_modules/**', '.next/**', '.git/**']
  });

  console.log(`Found ${files.length} PNG files to optimize`);

  let totalSaved = 0;
  let processedCount = 0;

  for (const file of files) {
    try {
      const originalSize = fs.statSync(file).size;

      const result = await imagemin([file], {
        destination: path.dirname(file),
        plugins: [
          imageminPngquant({
            quality: [0.6, 0.8], // 60-80% quality
            speed: 1 // Slower but better compression
          })
        ]
      });

      if (result && result.length > 0) {
        const newSize = result[0].data.length;
        const saved = originalSize - newSize;

        if (saved > 0) {
          totalSaved += saved;
          console.log(`✓ ${file}: ${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (saved ${(saved / 1024).toFixed(0)}KB)`);
        }
      }

      processedCount++;

      if (processedCount % 50 === 0) {
        console.log(`\nProgress: ${processedCount}/${files.length} files processed`);
        console.log(`Total saved so far: ${(totalSaved / 1024 / 1024).toFixed(2)}MB\n`);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  console.log('\n========================================');
  console.log(`✓ Optimization complete!`);
  console.log(`  Files processed: ${processedCount}`);
  console.log(`  Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)}MB`);
  console.log('========================================\n');
}

optimizeImages().catch(console.error);
