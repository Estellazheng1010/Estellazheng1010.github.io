const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始 Hexo 博客部署 - 本地覆盖远程模式...');

// 配置 - 需要保护的重要文件和文件夹
const PROTECTED_PATHS = [
  '.github/',
  'scripts/',
  'package.json',
  'package-lock.json',
  'quick-deploy.js',
  '.nojekyll'
];

function runCommand(command, description, ignoreErrors = false) {
  console.log(`📌 ${description}`);
  console.log(`   $ ${command}`);
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    if (result && result.trim()) {
      const lines = result.trim().split('\n');
      // 只显示前几行，避免过多输出
      console.log(`   ✅ 输出: ${lines.slice(0, 2).join(' | ')}${lines.length > 2 ? '...' : ''}`);
    }
    return true;
  } catch (error) {
    if (!ignoreErrors) {
      console.error(`   ❌ 错误: ${error.message}`);
      return false;
    }
    console.log(`   ⚠️ 忽略错误: ${error.message}`);
    return true;
  }
}

function checkProtectedFiles() {
  console.log('🔍 检查重要文件...');
  let allExist = true;
  
  PROTECTED_PATHS.forEach(item => {
    const exists = fs.existsSync(item);
    if (exists) {
      console.log(`   ✅ ${item}`);
    } else {
      console.log(`   ⚠️ ${item} - 文件不存在`);
      allExist = false;
    }
  });
  
  return allExist;
}

function forceSyncToRemote() {
  console.log('🔄 强制同步本地到远程...');
  
  // 确保我们在主分支
  runCommand('git checkout main', '切换到主分支', true);
  
  // 添加所有更改
  runCommand('git add .', '添加所有文件到暂存区', true);
  
  // 提交更改
  runCommand('git commit -m "自动部署: 更新博客内容和配置文件"', '提交所有更改', true);
  
  // 强制推送到远程（覆盖远程）
  console.log('📤 强制推送到远程仓库...');
  return runCommand('git push origin main --force', '强制推送到远程');
}

async function deploy() {
  try {
    // 1. 检查重要文件
    if (!checkProtectedFiles()) {
      console.log('⚠️ 某些重要文件缺失，继续部署但请注意风险');
    }

    // 2. 生成博客（但不使用 hexo deploy）
    console.log('\n📝 生成博客内容...');
    if (!runCommand('hexo clean', '清理生成文件')) {
      console.log('⚠️ 清理失败，继续尝试生成...');
    }
    
    if (!runCommand('hexo generate', '生成静态文件')) {
      console.error('❌ 生成失败，部署中止');
      process.exit(1);
    }

    // 3. 复制生成的文件到根目录（模拟 hexo deploy 的效果）
    console.log('📁 准备部署文件...');
    try {
      // 检查 public 目录是否存在
      if (fs.existsSync('public')) {
        // 复制 public 目录下的所有文件到当前目录
        runCommand('xcopy public\\* . /E /Y /I', '复制生成文件到根目录', true);
      } else {
        console.log('⚠️ public 目录不存在，跳过文件复制');
      }
    } catch (error) {
      console.log('⚠️ 文件复制失败，继续部署:', error.message);
    }

    // 4. 强制同步到远程
    console.log('\n📤 部署到 GitHub...');
    if (!forceSyncToRemote()) {
      console.error('❌ 部署失败');
      process.exit(1);
    }

    console.log('\n🎉 部署完成！');
    console.log('✅ 博客内容已更新');
    console.log('✅ 重要文件已保留');
    console.log('✅ 本地完全覆盖远程');
    console.log('🌐 访问: https://estellazheng1010.github.io');
    console.log('⏱️  页面更新可能需要几分钟');

  } catch (error) {
    console.error('\n❌ 部署过程中发生错误:', error.message);
    console.log('💡 建议检查:');
    console.log('   - Git 远程仓库权限');
    console.log('   - 网络连接');
    console.log('   - 文件权限');
  }
}

// 运行部署
deploy();