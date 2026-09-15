# 广告行业竞品监测平台

基于广告行业分析师的监测需求构建的实时竞品监测平台，跟踪全球主流广告平台动态，提供数据可视化和趋势分析。

## 📊 功能特性

### 1. 平台动态监测
- **国内平台**：抖音/巨量引擎、腾讯广告、快手/磁力引擎、小红书/聚光、B站商业化
- **海外平台**：Google Ads、Meta、X (Twitter)、TikTok
- **监测维度**：产品更新、策略调整、数据变化、财报信息

### 2. 行业趋势分析
- 自动聚合相似变化，识别行业趋势
- 区分新变化、延续趋势、结构性转折
- 提供影响分析和战略建议

### 3. 数据可视化
- 平台市场份额分布（饼图）
- eCPM趋势变化（折线图）
- 关键指标卡片（市场规模、AI占比等）

### 4. 行业报告汇总
- 跟踪QuestMobile、TopOn、秒针、德勤、AppGrowing、SensorTower等机构
- 提取核心结论和洞察
- 提供报告下载链接

### 5. 智能筛选
- 按地区筛选（国内/海外/全部）
- 按平台筛选
- 按变化类型筛选

## 🚀 快速开始

### 直接使用
1. 双击打开 `index.html` 文件即可在浏览器中查看
2. 无需安装任何依赖，纯前端实现

### 本地服务器（推荐）
```bash
# 使用Python启动本地服务器
cd ad-monitor-platform
python3 -m http.server 8000

# 或使用Node.js
npx http-server -p 8000

# 然后在浏览器访问
open http://localhost:8000
```

## 📁 项目结构

```
ad-monitor-platform/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── app.js              # 前端应用逻辑
├── data.json           # 数据文件（每日更新）
├── update-daily.js     # 每日数据更新脚本
├── README.md           # 项目说明
└── backups/            # 数据备份目录（自动创建）
```

## 🔄 每日自动更新

### 方式1：手动执行
```bash
node update-daily.js
```

### 方式2：设置定时任务（每天上午9点自动执行）

**macOS/Linux (crontab)**
```bash
crontab -e

# 添加以下行
0 9 * * * cd /Users/shuang.liang/Desktop/ad-monitor-platform && node update-daily.js
```

**Windows (任务计划程序)**
1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：每天上午9:00
4. 操作：启动程序 `node.exe`
5. 参数：`update-daily.js`
6. 起始于：`C:\path\to\ad-monitor-platform`

### 方式3：使用GitHub Actions（推荐）

如果将项目托管到GitHub，可以使用GitHub Actions实现云端自动更新：

创建 `.github/workflows/daily-update.yml`：
```yaml
name: Daily Data Update

on:
  schedule:
    - cron: '0 1 * * *'  # 每天UTC 1:00（北京时间9:00）
  workflow_dispatch:      # 支持手动触发

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: node update-daily.js
      - name: Commit and push
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add data.json backups/
          git commit -m "Daily data update $(date +'%Y-%m-%d')" || exit 0
          git push
```

## 📝 数据更新脚本说明

`update-daily.js` 脚本框架已包含以下功能：

1. **平台动态抓取**：支持9大主流广告平台
2. **数据去重**：自动识别重复内容
3. **趋势分析**：基于新动态生成趋势洞察
4. **数据备份**：每次更新自动备份历史数据

### 需要定制的部分

脚本中标记了 `TODO` 的部分需要根据实际情况实现：

```javascript
// 1. 实现真实的数据抓取
async fetchFromSource(source) {
    // 方式1: 调用官方API
    // 方式2: 解析RSS订阅
    // 方式3: 网页爬虫
}

// 2. 对接第三方数据服务
async updateMarketData() {
    // QuestMobile API
    // TopOn API
    // SensorTower API
}

// 3. 实现趋势分析（可选用AI）
async updateTrends() {
    // 调用GPT-4 API
    // 或使用本地NLP模型
}
```

### 数据源建议

**平台官方数据源**：
- Google Ads: https://ads.google.com/updates
- Meta Business: https://www.facebook.com/business/news
- 巨量引擎: https://www.oceanengine.com/news
- 腾讯广告: https://e.qq.com/ads/news
- TikTok Business: https://business.tiktok.com/updates

**第三方数据服务**：
- QuestMobile: https://www.questmobile.com.cn
- TopOn: https://www.toponad.com
- 秒针系统: https://www.miaozhen.com
- AppGrowing: https://www.appgrowing.cn
- SensorTower: https://sensortower.com

## 🎨 自定义配置

### 修改监测平台列表
编辑 `data.json` 中的 `updates` 数组，添加或删除平台。

### 修改图表样式
编辑 `app.js` 中的 Chart.js 配置：
```javascript
// 修改配色方案
backgroundColor: ['#667eea', '#764ba2', ...]

// 修改图表类型
type: 'doughnut'  // 改为 'pie', 'bar', 'line' 等
```

### 修改页面样式
编辑 `styles.css` 中的CSS变量：
```css
:root {
    --primary-color: #2563eb;    /* 主色调 */
    --bg-color: #f8fafc;          /* 背景色 */
    --card-bg: #ffffff;           /* 卡片背景 */
}
```

## 📱 响应式设计

平台已适配移动端，支持：
- 手机（< 768px）
- 平板（768px - 1024px）
- 桌面（> 1024px）

## 🔐 数据安全

- 所有数据存储在本地 `data.json` 文件
- 每次更新自动备份到 `backups/` 目录
- 无需数据库，轻量级部署
- 建议定期将 `backups/` 目录同步到云存储

## 🚢 部署建议

### 1. 静态网站托管（最简单）
- **GitHub Pages**：免费，支持自定义域名
- **Vercel/Netlify**：免费，自动HTTPS
- **对象存储**：阿里云OSS、腾讯云COS

### 2. 服务器部署
- Nginx/Apache 直接托管静态文件
- 使用Node.js Express提供API接口

### 3. 内网部署
- 适合企业内部使用
- 部署到内网服务器，限制访问权限

## 📊 数据格式说明

### Update对象结构
```json
{
  "platform": "平台名称",
  "platformId": "平台ID（用于筛选）",
  "region": "domestic/overseas",
  "date": "2026-09-07",
  "changeType": "product/strategy/data/financial",
  "content": "变化内容描述",
  "impacts": ["影响标签1", "影响标签2"],
  "source": "来源链接"
}
```

### Trend对象结构
```json
{
  "type": "new/continue/turning",
  "title": "趋势标题",
  "description": "趋势描述",
  "impact": "影响分析"
}
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发建议
1. Fork本项目
2. 创建功能分支 `git checkout -b feature/AmazingFeature`
3. 提交更改 `git commit -m 'Add some AmazingFeature'`
4. 推送到分支 `git push origin feature/AmazingFeature`
5. 创建Pull Request

## 📄 许可证

本项目仅供学习和内部使用，请勿用于商业用途。

## 📧 联系方式

如有问题或建议，请通过以下方式联系：
- 创建GitHub Issue
- 发送邮件到项目维护者

---

**更新日志**
- 2026-09-07: v1.0 初始版本发布
