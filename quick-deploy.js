const { execSync } = require('child_process');

console.log('🚀 开始快速部署...');

// 生成并部署
execSync('hexo clean && hexo g -d', { stdio: 'inherit' });

// 立即重新添加重要文件
console.log('📁 重新添加重要文件...');
execSync('git add .github/ scripts/ package.json package-lock.json', { stdio: 'inherit' });
execSync('git commit -m "恢复重要文件" || true', { stdio: 'inherit' });
execSync('git push origin main', { stdio: 'inherit' });

console.log('✅ 部署完成，重要文件已恢复！');