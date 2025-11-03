---
title: 邮件退订
layout: page
---

<div class="unsubscribe-page">
  <h1>邮件退订</h1>
  <p>我们很遗憾看到您想要退订。</p>
  <div id="unsubscribe-message"></div>
</div>

<script>
// 获取 URL 中的 token 参数
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (token) {
  // 调用 LeanCloud 更新订阅状态
  fetch('https://q42ipaqj.api.lncldglobal.com/1.1/classes/Subscribers', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-LC-Id': 'q42iPaqJ0kehJAPk32F8He01-MdYXbMMI',
      'X-LC-Key': 'Pj0w9P4mFXoxRzzFaHdk2kQt'
    }
  })
  .then(response => response.json())
  .then(data => {
    const subscriber = data.results.find(item => item.token === token);
    if (subscriber) {
      // 更新订阅状态为 false
      fetch(`https://q42ipaqj.api.lncldglobal.com/1.1/classes/Subscribers/${subscriber.objectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-LC-Id': 'q42iPaqJ0kehJAPk32F8He01-MdYXbMMI',
          'X-LC-Key': 'Pj0w9P4mFXoxRzzFaHdk2kQt'
        },
        body: JSON.stringify({
          subscribed: false
        })
      })
      .then(response => response.json())
      .then(result => {
        document.getElementById('unsubscribe-message').innerHTML = 
          '<p style="color: green;">退订成功！您将不再收到我们的更新邮件。</p>';
      });
    } else {
      document.getElementById('unsubscribe-message').innerHTML = 
        '<p style="color: red;">无效的退订链接！</p>';
    }
  });
} else {
  document.getElementById('unsubscribe-message').innerHTML = 
    '<p style="color: red;">缺少退订参数！</p>';
}
</script>