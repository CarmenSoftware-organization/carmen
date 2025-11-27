const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/(main)/vendor-management/**/*.{ts,tsx}', { nodir: true });

let filesFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Fix relative mock-data imports
  const patterns = [
    { from: /from ['"]\.\.\/\.\.\/lib\/mock-data['"]/g, to: "from '@/lib/mock-data'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/lib\/mock-data['"]/g, to: "from '@/lib/mock-data'" },
    { from: /from ['"]\.\.\/lib\/mock-data['"]/g, to: "from '@/lib/mock-data'" },
    { from: /from ['"]\.\/mock-data['"]/g, to: "from '@/lib/mock-data'" }
  ];

  patterns.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    filesFixed++;
    console.log(`Fixed: ${file}`);
  }
});

console.log(`\nTotal files fixed: ${filesFixed}`);
