// 订阅按钮处理 - 修复版
document.addEventListener('DOMContentLoaded', function() {
  initSubscribeButton();
});

// 初始化订阅按钮
function initSubscribeButton() {
  const subscribeBtn = document.getElementById('subscribe-btn');
  
  if (!subscribeBtn) {
      console.log('订阅按钮未找到，等待侧边栏加载...');
      // 如果侧边栏是动态加载的，延迟重试
      setTimeout(initSubscribeButton, 500);
      return;
  }
  
  console.log('找到订阅按钮，绑定点击事件...');
  
  // 移除可能存在的旧事件
  subscribeBtn.removeEventListener('click', handleSubscribe);
  
  // 绑定新事件
  subscribeBtn.addEventListener('click', handleSubscribe);
}

// 处理订阅
function handleSubscribe(e) {
  if (e) e.preventDefault();
  
  const email = document.getElementById('subscriber-email').value;
  const messageDiv = document.getElementById('subscribe-msg');
  const subscribeBtn = document.getElementById('subscribe-btn');
  
  // 验证邮箱
  if (!email) {
      showMessage('请输入邮箱地址', 'error', messageDiv);
      return;
  }
  
  if (!isValidEmail(email)) {
      showMessage('请输入有效的邮箱地址', 'error', messageDiv);
      return;
  }
  
  // 显示加载状态
  showMessage('订阅中...', 'loading', messageDiv);
  subscribeBtn.disabled = true;
  
  // 调用 LeanCloud 保存订阅信息 - 修复了URL
  fetch('https://q42ipaqj.api.lncldglobal.com/1.1/classes/Subscribers', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-LC-Id': 'q42iPaqJ0kehJAPk32F8He01-MdYXbMMI',
          'X-LC-Key': 'Pj0w9P4mFXoxRzzFaHdk2kQt'
      },
      body: JSON.stringify({
          email: email,
          subscribed: true,
          token: generateToken(),
          createdAt: new Date(),
          status: 'active',
          source: 'website'
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('网络响应不正常');
      }
      return response.json();
  })
  .then(data => {
      console.log('订阅成功:', data);
      showMessage('订阅成功！', 'success', messageDiv);
      document.getElementById('subscriber-email').value = ''; // 清空输入框
  })
  .catch(error => {
      console.error('订阅错误:', error);
      if (error.message.includes('already exists') || error.message.includes('重复')) {
          showMessage('该邮箱已经订阅过了', 'warning', messageDiv);
      } else {
          showMessage('订阅失败，请重试', 'error', messageDiv);
      }
  })
  .finally(() => {
      subscribeBtn.disabled = false;
  });
}

// 邮箱验证函数
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 显示消息函数
function showMessage(message, type = 'info', messageDiv) {
  if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `subscribe-message ${type}`;
      
      // 3秒后清除成功/警告消息
      if (type === 'success' || type === 'warning') {
          setTimeout(() => {
              messageDiv.textContent = '';
              messageDiv.className = 'subscribe-message';
          }, 3000);
      }
  } else {
      console.log(`${type}: ${message}`);
  }
}

// 生成退订令牌
function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 侧边栏动态加载支持
document.addEventListener('click', function(e) {
  // 如果点击了打开侧边栏的按钮
  if (e.target.closest('.sidebar-toggle, .menu-toggle')) {
      setTimeout(initSubscribeButton, 800); // 等待侧边栏动画完成
  }
});