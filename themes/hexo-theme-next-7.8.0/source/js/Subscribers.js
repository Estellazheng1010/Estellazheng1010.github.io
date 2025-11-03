// 订阅功能处理 - 修复版
document.addEventListener('DOMContentLoaded', function() {
  initSubscribe();
});

function initSubscribe() {
  const subscribeBtn = document.getElementById('subscribe-btn');
  const emailInput = document.getElementById('subscriber-email');
  
  if (!subscribeBtn) {
      console.log('订阅按钮未找到，等待侧边栏加载...');
      setTimeout(initSubscribe, 500);
      return;
  }
  
  console.log('找到订阅按钮，绑定事件...');
  
  // 移除旧的点击事件
  subscribeBtn.removeEventListener('click', handleSubscribe);
  
  // 绑定新的点击事件
  subscribeBtn.addEventListener('click', handleSubscribe);
}

function handleSubscribe(e) {
  e.preventDefault();
  console.log('订阅按钮被点击！');
  
  const emailInput = document.getElementById('subscriber-email');
  const messageDiv = document.getElementById('subscribe-msg');
  const subscribeBtn = document.getElementById('subscribe-btn');
  
  const email = emailInput ? emailInput.value.trim() : '';
  
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
  subscribeBtn.textContent = '订阅中...';
  
  // 修复 URL - 去掉重复的 https://
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
          throw new Error('网络请求失败: ' + response.status);
      }
      return response.json();
  })
  .then(data => {
      console.log('订阅成功:', data);
      showMessage('订阅成功！', 'success', messageDiv);
      if (emailInput) emailInput.value = '';
  })
  .catch(error => {
      console.error('订阅错误:', error);
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          showMessage('该邮箱已经订阅过了', 'warning', messageDiv);
      } else {
          showMessage('订阅失败，请重试', 'error', messageDiv);
      }
  })
  .finally(() => {
      subscribeBtn.disabled = false;
      subscribeBtn.textContent = '订阅';
      
      // 3秒后清除消息
      setTimeout(() => {
          if (messageDiv) messageDiv.textContent = '';
      }, 3000);
  });
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showMessage(message, type, messageDiv) {
  if (messageDiv) {
      messageDiv.textContent = message;
      // 根据类型设置颜色
      const colors = {
          success: 'green',
          error: 'red',
          warning: 'orange',
          loading: 'blue',
          info: 'gray'
      };
      messageDiv.style.color = colors[type] || 'black';
  }
  console.log(type + ': ' + message);
}

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 侧边栏动态加载支持
document.addEventListener('click', function(e) {
  if (e.target.closest('.sidebar-toggle, .menu-toggle')) {
      setTimeout(initSubscribe, 800);
  }
});