import fs from 'fs';
import path from 'path';

function scopeFile(filename) {
  const cssPath = path.resolve('src/modules/showroom/presentation/' + filename);
  let cssContent = fs.readFileSync(cssPath, 'utf8');

  // 1. Chuyển :root thành .showroom-root
  cssContent = cssContent.replace(/:root/g, '.showroom-root');

  // 2. Chuyển * thành .showroom-root *
  cssContent = cssContent.replace(/\*\s*\{/g, '.showroom-root * {');

  // 3. Chuyển html thành .showroom-root
  cssContent = cssContent.replace(/html\s*\{/g, '.showroom-root {');

  // 4. Chuyển body thành .showroom-root
  cssContent = cssContent.replace(/body\s*\{/g, '.showroom-root {');

  // Ghi đè lại tệp CSS
  fs.writeFileSync(cssPath, cssContent, 'utf8');
  console.log(`Scoped ${filename} successfully!`);
}

scopeFile('Showroom.css');
scopeFile('ShowroomGuide.css');
