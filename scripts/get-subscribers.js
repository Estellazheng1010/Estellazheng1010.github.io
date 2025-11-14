const AV = require('leancloud-storage');

// 检查是否在本地 Hexo 环境中运行
if (!process.env.GITHUB_ACTIONS && !process.env.LEANCLOUD_APP_ID) {
  console.log('在本地 Hexo 环境中，跳过 LeanCloud 初始化');
  module.exports = async function() { return []; };
  return;
}

// 只在有环境变量时才初始化 LeanCloud
function initLeanCloud() {
  if (!process.env.LEANCLOUD_APP_ID || !process.env.LEANCLOUD_APP_KEY) {
    console.log('LeanCloud 环境变量未设置，跳过初始化');
    return false;
  }
  
  AV.init({
    appId: process.env.LEANCLOUD_APP_ID,
    appKey: process.env.LEANCLOUD_APP_KEY,
    serverURL: process.env.LEANCLOUD_SERVER_URL
  });
  return true;
}

async function getSubscribers() {
  // 检查环境变量
  if (!process.env.LEANCLOUD_APP_ID) {
    console.log('跳过获取订阅者 - 环境变量未设置');
    return [];
  }
  
  // 初始化 LeanCloud
  if (!initLeanCloud()) {
    return [];
  }
  
  try {
    console.log('Fetching subscribers from LeanCloud...');
    
    const Subscriber = AV.Object.extend('Subscriber');
    const query = new AV.Query(Subscriber);
    
    query.equalTo('confirmed', true);
    query.equalTo('active', true);
    
    const subscribers = await query.find();
    console.log(`Found ${subscribers.length} subscribers`);
    
    const subscriberList = subscribers.map(sub => ({
      email: sub.get('email'),
      name: sub.get('name') || 'Subscriber',
      unsubscribeToken: sub.get('unsubscribeToken')
    }));
    
    return subscriberList;
    
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return []; // 返回空数组而不是抛出错误
  }
}

// 如果直接运行此脚本，则执行获取订阅者
if (require.main === module) {
  getSubscribers()
    .then(subscribers => {
      console.log('Subscribers:', JSON.stringify(subscribers, null, 2));
    })
    .catch(error => {
      console.error('Failed to get subscribers:', error);
      process.exit(1);
    });
}

module.exports = getSubscribers;