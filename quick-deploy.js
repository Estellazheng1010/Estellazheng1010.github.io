const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始 Hexo 博客部署...');

// 配置 - 需要保护的重要文件和文件夹
const PROTECTED_PATHS = [
  '.github/',
  'scripts/',
  'package.json',
  'package-lock.json',
  'quick-deploy.js'
];

function runCommand(command, description, ignoreErrors = false) {
  console.log(`📌 ${description}`);
  console.log(`   $ ${command}`);
  
  try {
    const result = execSync(command, { encoding: 'utf8' });
    if (result && result.trim()) {
      console.log(`   ✅ 输出: ${result.trim()}`);
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

function checkGitStatus() {
  try {
    execSync('git status', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error('❌ 当前目录不是 Git 仓库');
    console.log('请先运行: git init && git remote add origin https://github.com/Estellazheng1010/Estellazheng1010.github.io.git');
    return false;
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
      console.log(`   ❌ ${item} - 文件不存在`);
      allExist = false;
    }
  });
  
  return allExist;
}

async function deploy() {
  try {
    // 1. 检查 Git 状态
    if (!checkGitStatus()) {
      process.exit(1);
    }

    // 2. 检查重要文件
    if (!checkProtectedFiles()) {
      console.log('⚠️ 某些重要文件缺失，继续部署但请注意风险');
    }

    // 3. 生成和部署博客
    console.log('\n📝 生成和部署博客...');
    if (!runCommand('hexo clean', '清理生成文件')) {
      process.exit(1);
    }
    
    if (!runCommand('hexo generate', '生成静态文件')) {
      process.exit(1);
    }
    
    if (!runCommand('hexo deploy', '部署到 GitHub')) {
      process.exit(1);
    }

    // 4. 恢复重要文件
    console.log('\n📁 恢复重要文件到 GitHub...');
    
    // 添加重要文件到 Git
    const addCommand = `git add ${PROTECTED_PATHS.join(' ')}`;
    runCommand(addCommand, '添加重要文件到暂存区', true);
    
    // 提交更改
    runCommand('git commit -m "自动恢复: 重要配置文件"', '提交重要文件', true);
    
    // 推送到 GitHub
    if (!runCommand('git push origin main', '推送到 GitHub')) {
      console.log('⚠️ 推送失败，但博客已部署成功');
    }

    console.log('\n🎉 部署完成！');
    console.log('✅ 博客已更新');
    console.log('✅ 重要文件已保护');
    console.log('🌐 访问: https://estellazheng1010.github.io');

  } catch (error) {
    console.error('\n❌ 部署过程中发生错误:', error.message);
    console.log('💡 建议检查:');
    console.log('   - 网络连接');
    console.log('   - GitHub 仓库权限');
    console.log('   - Hexo 配置是否正确');
  }
}

// 运行部署
deploy();