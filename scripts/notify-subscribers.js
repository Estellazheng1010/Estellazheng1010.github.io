const nodemailer = require('nodemailer');
const getSubscribers = require('./get-subscribers');

// 检查是否在本地 Hexo 环境中运行
if (!process.env.GITHUB_ACTIONS && (!process.env.LEANCLOUD_APP_ID || !process.env.SMTP_USER)) {
  console.log('在本地 Hexo 环境中，跳过通知脚本执行');
  // 在 Hexo 环境中，直接退出而不执行
  if (typeof module !== 'undefined' && module.exports) {
    // 在 Node.js 环境中
    process.exit(0);
  }
  // 在其他环境中，直接返回
  return;
}

// 邮件配置
const smtpConfig = {
  host: 'smtp.gmail.com', // 或其他SMTP服务器
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// 创建邮件传输器
const transporter = nodemailer.createTransport(smtpConfig);

// 验证SMTP连接
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

// 邮件模板
function createEmailTemplate(subscriber, postTitle, postUrl) {
  const unsubscribeUrl = `https://estellazheng1010.github.io/unsubscribe?token=${subscriber.unsubscribeToken}`;
  
  return {
    subject: `新文章发布: ${postTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f4f4f4; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; padding: 10px 20px; background: #007cba; color: white; text-decoration: none; border-radius: 5px; }
          .footer { margin-top: 20px; padding: 20px; background: #f4f4f4; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>新文章发布</h1>
          </div>
          <div class="content">
            <p>亲爱的 ${subscriber.name},</p>
            <p>我们刚刚发布了一篇新文章：</p>
            <h2>${postTitle}</h2>
            <p>
              <a href="${postUrl}" class="button">阅读全文</a>
            </p>
            <p>希望您喜欢这篇文章！</p>
          </div>
          <div class="footer">
            <p>如果您不希望再收到这些通知，您可以 <a href="${unsubscribeUrl}">取消订阅</a>。</p>
            <p>&copy; 2024 Estella's Blog. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
新文章发布: ${postTitle}

亲爱的 ${subscriber.name},

我们刚刚发布了一篇新文章：${postTitle}

阅读全文: ${postUrl}

希望您喜欢这篇文章！

如果您不希望再收到这些通知，请访问以下链接取消订阅：
${unsubscribeUrl}

© 2024 Estella's Blog. All rights reserved.
    `
  };
}

async function sendNotification() {
  try {
    const postTitle = process.env.LATEST_POST_TITLE || 'New Blog Post';
    const postUrl = process.env.LATEST_POST_URL || 'https://estellazheng1010.github.io';
    
    console.log(`Preparing to notify subscribers about: ${postTitle}`);
    console.log(`Post URL: ${postUrl}`);
    
    // 获取订阅者列表
    const subscribers = await getSubscribers();
    
    if (subscribers.length === 0) {
      console.log('No subscribers found. Exiting.');
      return;
    }
    
    console.log(`Sending notifications to ${subscribers.length} subscribers...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // 为每个订阅者发送邮件
    for (const subscriber of subscribers) {
      try {
        const emailTemplate = createEmailTemplate(subscriber, postTitle, postUrl);
        
        const mailOptions = {
          from: `"Estella\'s Blog" <${process.env.SMTP_USER}>`,
          to: subscriber.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`✓ Email sent to: ${subscriber.email}`);
        successCount++;
        
        // 添加延迟避免被SMTP服务器限制
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`✗ Failed to send email to ${subscriber.email}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nNotification summary:`);
    console.log(`✓ Successfully sent: ${successCount}`);
    console.log(`✗ Failed: ${errorCount}`);
    console.log(`📊 Total processed: ${subscribers.length}`);
    
  } catch (error) {
    console.error('Notification process failed:', error);
    process.exit(1);
  }
}

// 只在直接运行或 GitHub Actions 中执行
if (require.main === module || process.env.GITHUB_ACTIONS) {
  sendNotification();
}

module.exports = sendNotification;