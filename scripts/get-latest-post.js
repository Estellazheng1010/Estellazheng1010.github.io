const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 博客基础URL - 请根据你的实际情况修改
const BLOG_BASE_URL = 'https://estellazheng1010.github.io';

function getLatestPost() {
  try {
    // 获取最新的提交中修改的markdown文件
    const command = 'git diff --name-only HEAD~1 HEAD | grep -E "\\.(md|markdown)$" | head -1';
    const latestPostFile = execSync(command, { encoding: 'utf8' }).trim();
    
    let postFile;
    
    if (latestPostFile) {
      postFile = latestPostFile;
    } else {
      // 如果没有找到修改的文件，尝试获取_posts目录下最新的文件
      const postsDir = '_posts';
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir)
          .filter(file => file.endsWith('.md') || file.endsWith('.markdown'))
          .sort()
          .reverse();
        
        if (files.length > 0) {
          postFile = path.join(postsDir, files[0]);
        }
      }
    }
    
    if (!postFile || !fs.existsSync(postFile)) {
      throw new Error('No post file found');
    }
    
    // 读取文件内容
    const content = fs.readFileSync(postFile, 'utf8');
    
    // 解析Front Matter获取标题
    let title = path.basename(postFile, path.extname(postFile));
    const titleMatch = content.match(/title:\s*["']?(.*?)["']?\s*$/m);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }
    
    // 生成文章URL
    const fileName = path.basename(postFile, path.extname(postFile));
    const dateMatch = fileName.match(/(\d{4}-\d{2}-\d{2})-/);
    let url = `${BLOG_BASE_URL}/`;
    
    if (dateMatch) {
      const date = dateMatch[1];
      const slug = fileName.replace(dateMatch[0], '');
      url = `${BLOG_BASE_URL}/${date.replace(/-/g, '/')}/${slug}/`;
    }
    
    // 输出到标准输出，供GitHub Actions捕获
    console.log(`TITLE: ${title}`);
    console.log(`URL: ${url}`);
    
    return { title, url };
    
  } catch (error) {
    console.error('Error getting latest post:', error.message);
    
    // 返回默认值，避免工作流失败
    const defaultTitle = 'New Blog Post';
    const defaultUrl = BLOG_BASE_URL;
    
    console.log(`TITLE: ${defaultTitle}`);
    console.log(`URL: ${defaultUrl}`);
    
    return { title: defaultTitle, url: defaultUrl };
  }
}

getLatestPost();