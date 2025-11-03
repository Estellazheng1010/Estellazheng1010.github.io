// 订阅表单处理
document.getElementById('subscribe-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('subscribe-email').value;
    const messageDiv = document.getElementById('subscribe-message');
    
    // 调用 LeanCloud 保存订阅信息
    fetch('https://https://q42ipaqj.api.lncldglobal.com/1.1/classes/Subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LC-Id': 'q42iPaqJ0kehJAPk32F8He01-MdYXbMMI',
        'X-LC-Key': 'Pj0w9P4mFXoxRzzFaHdk2kQt'
      },
      body: JSON.stringify({
        email: email,
        subscribed: true,
        token: generateToken(), // 生成唯一令牌
        createdAt: new Date()
      })
    })
    .then(response => response.json())
    .then(data => {
      messageDiv.innerHTML = '<p style="color: green;">订阅成功！</p>';
      document.getElementById('subscribe-form').reset();
    })
    .catch(error => {
      console.error('Error:', error);
      messageDiv.innerHTML = '<p style="color: red;">订阅失败，请重试</p>';
    });
  });
  
  // 生成退订令牌
  function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }