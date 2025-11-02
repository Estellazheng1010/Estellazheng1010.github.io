document.addEventListener('DOMContentLoaded', function() {
    const subscribeBtn = document.getElementById('subscribe-btn');
    const emailInput = document.getElementById('subscriber-email');
    const messageDiv = document.getElementById('subscribe-msg');
  
    subscribeBtn.addEventListener('click', function() {
      const email = emailInput.value.trim();
      messageDiv.textContent = '处理中...'; // 提示用户
  
      // 初始化LeanCloud，APP ID 和 APP Key 替换成你自己的
      AV.init({
        appId: 'q42iPaqJ0kehJAPk32F8He01-MdYXbMMI',
        appKey: 'Pj0w9P4mFXoxRzzFaHdk2kQt',
        serverURLs: 'https://q42ipaqj.api.lncldglobal.com' // 若未绑定自定义域名，通常不需要
      });
  
      // 创建Subscriber对象
      const Subscriber = AV.Object.extend('Subscriber');
      const newSubscriber = new Subscriber();
  
      // 设置邮箱字段
      newSubscriber.set('email', email);
      newSubscriber.set('status', 'active'); // 可添加状态字段
  
      // 保存到LeanCloud
      newSubscriber.save().then(function() {
        // 保存成功
        messageDiv.textContent = '订阅成功！感谢您的关注。';
        messageDiv.style.color = 'green';
        emailInput.value = ''; // 清空输入框
      }).catch(function(error) {
        // 保存失败
        console.error('订阅失败:', error);
        messageDiv.textContent = '订阅失败，请稍后重试或检查邮箱格式。';
        messageDiv.style.color = 'red';
      });
    });
  });