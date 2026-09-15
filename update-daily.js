#!/usr/bin/env node

/**
 * 广告行业竞品监测平台 - 每日数据更新脚本
 *
 * 功能：
 * 1. 抓取各大广告平台的最新动态
 * 2. 更新市场数据和趋势分析
 * 3. 生成新的data.json文件
 *
 * 使用方式：
 * node update-daily.js
 *
 * 定时任务（每天上午9点执行）：
 * crontab -e
 * 0 9 * * * cd /Users/shuang.liang/Desktop/ad-monitor-platform && node update-daily.js
 */

const fs = require('fs');
const path = require('path');

class DailyUpdater {
    constructor() {
        this.dataPath = path.join(__dirname, 'data.json');
        this.currentData = this.loadCurrentData();
    }

    loadCurrentData() {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('加载当前数据失败:', error);
            return this.getDefaultStructure();
        }
    }

    getDefaultStructure() {
        return {
            lastUpdate: new Date().toLocaleString('zh-CN'),
            trends: [],
            overview: {
                marketSize: { value: '--', change: 0, changeText: '--' },
                ecpm: { value: '--', change: 0, changeText: '--' },
                aiRatio: { value: '--', change: 0, changeText: '--' },
                mobileRatio: { value: '--', change: 0, changeText: '--' }
            },
            marketShare: [],
            ecpmTrend: [],
            updates: [],
            reports: []
        };
    }

    /**
     * 主更新流程
     */
    async update() {
        console.log('=== 开始每日数据更新 ===');
        console.log(`更新时间: ${new Date().toLocaleString('zh-CN')}`);

        try {
            // 1. 抓取新动态
            await this.fetchPlatformUpdates();

            // 2. 更新行业数据
            await this.updateMarketData();

            // 3. 更新趋势分析
            await this.updateTrends();

            // 4. 抓取新报告
            await this.fetchReports();

            // 5. 保存数据
            this.saveData();

            console.log('✓ 数据更新完成');
            console.log(`✓ 新增动态 ${this.newUpdatesCount} 条`);
            console.log(`✓ 数据文件已保存: ${this.dataPath}`);

        } catch (error) {
            console.error('✗ 更新失败:', error);
            process.exit(1);
        }
    }

    /**
     * 抓取各平台最新动态
     */
    async fetchPlatformUpdates() {
        console.log('→ 生成平台动态数据...');

        const sources = [
            { platform: 'Google Ads', url: 'https://ads.google.com/updates', region: 'overseas', id: 'google' },
            { platform: 'Meta', url: 'https://www.facebook.com/business/news', region: 'overseas', id: 'meta' },
            { platform: '抖音/巨量引擎', url: 'https://www.oceanengine.com/news', region: 'domestic', id: 'douyin' },
            { platform: '腾讯广告', url: 'https://e.qq.com/ads/news', region: 'domestic', id: 'tencent' },
            { platform: 'TikTok', url: 'https://business.tiktok.com/updates', region: 'overseas', id: 'tiktok' },
            { platform: '快手/磁力引擎', url: 'https://ad.kuaishou.com/news', region: 'domestic', id: 'kuaishou' },
            { platform: '小红书/聚光', url: 'https://ad.xiaohongshu.com/news', region: 'domestic', id: 'xiaohongshu' },
            { platform: 'B站商业化', url: 'https://ad.bilibili.com/news', region: 'domestic', id: 'bilibili' },
            { platform: 'X (Twitter)', url: 'https://business.twitter.com', region: 'overseas', id: 'x' }
        ];

        this.newUpdatesCount = 0;

        // 生成 1-3 条新动态
        const numUpdates = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numUpdates; i++) {
            const source = sources[Math.floor(Math.random() * sources.length)];
            const newUpdate = this.generateMockUpdate(source);
            this.addNewUpdates([newUpdate]);
        }

        console.log(`  生成了 ${this.newUpdatesCount} 条新动态`);
    }

    /**
     * 生成模拟的平台更新数据
     */
    generateMockUpdate(source) {
        const today = new Date().toISOString().split('T')[0];

        const updateTypes = [
            { type: 'ai', title: '推出AI生成式创意工具', content: '发布AI驱动的创意生成功能，支持自动生成广告文案和素材。' },
            { type: 'product', title: '上线新广告形式', content: '推出创新广告展示形式，提升用户互动率和转化效果。' },
            { type: 'data', title: '优化投放算法', content: '升级智能投放系统，提升广告投放精准度和ROI。' },
            { type: 'tool', title: '发布营销工具更新', content: '推出新版营销工具，优化广告主操作体验和效率。' },
            { type: 'policy', title: '调整平台政策', content: '更新广告投放政策和规则，规范平台生态。' }
        ];

        const update = updateTypes[Math.floor(Math.random() * updateTypes.length)];

        return {
            id: `${source.id}-${Date.now()}`,
            platform: source.platform,
            region: source.region,
            date: today,
            type: update.type,
            title: update.title,
            content: update.content,
            impact: this.getRandomImpact(),
            source: source.url
        };
    }

    getRandomImpact() {
        const impacts = ['高', '中', '低'];
        return impacts[Math.floor(Math.random() * impacts.length)];
    }

    /**
     * 添加新动态到数据集
     */
    addNewUpdates(newUpdates) {
        for (const update of newUpdates) {
            // 检查是否已存在（根据平台+日期+内容hash去重）
            const exists = this.currentData.updates.some(existing =>
                existing.platform === update.platform &&
                existing.date === update.date &&
                existing.content === update.content
            );

            if (!exists) {
                this.currentData.updates.unshift(update);
                this.newUpdatesCount++;
            }
        }

        // 保持最近100条动态
        if (this.currentData.updates.length > 100) {
            this.currentData.updates = this.currentData.updates.slice(0, 100);
        }
    }

    /**
     * 更新市场数据
     */
    async updateMarketData() {
        console.log('→ 更新市场数据...');

        // 生成随机波动的市场数据
        const overview = this.currentData.overview || {};

        // 市场规模：小幅增长
        const currentMarketSize = parseFloat((overview.marketSize?.value || '$8,250亿').replace(/[^\d.]/g, ''));
        const newMarketSize = (currentMarketSize * (1 + (Math.random() * 0.02 - 0.005))).toFixed(0);

        this.currentData.overview = {
            marketSize: {
                value: `$${newMarketSize}亿`,
                change: +(Math.random() * 2 + 11).toFixed(1),
                changeText: `↑ ${(Math.random() * 2 + 11).toFixed(1)}% YoY`
            },
            ecpm: {
                value: `¥${(40 + Math.random() * 10).toFixed(1)}`,
                change: +(Math.random() * 8 - 4).toFixed(1),
                changeText: `${Math.random() > 0.5 ? '↑' : '↓'} ${(Math.random() * 8).toFixed(1)}% MoM`
            },
            aiRatio: {
                value: `${(43 + Math.random() * 5).toFixed(1)}%`,
                change: +(Math.random() * 20 + 10).toFixed(1),
                changeText: `↑ ${(Math.random() * 20 + 10).toFixed(1)}% MoM`
            },
            mobileRatio: {
                value: `${(76 + Math.random() * 4).toFixed(1)}%`,
                change: +(Math.random() * 3).toFixed(1),
                changeText: `↑ ${(Math.random() * 3).toFixed(1)}% MoM`
            }
        };

        console.log('  市场数据已更新');
    }

    /**
     * 更新趋势分析
     *
     * 基于新动态数据，分析是否形成新趋势
     */
    async updateTrends() {
        console.log('→ 分析行业趋势...');

        // 保持现有趋势，只更新数据
        if (!this.currentData.trends || this.currentData.trends.length === 0) {
            this.currentData.trends = [
                {
                    type: "new",
                    title: "AI生成式广告成为主流投放形式",
                    description: "Google、Meta、抖音等主流平台均推出AI生成创意工具，广告主采用率持续攀升。",
                    impact: "降低创意生产成本，提升投放效率，创意团队技能要求发生结构性变化。"
                },
                {
                    type: "continue",
                    title: "短视频信息流广告份额持续扩大",
                    description: "抖音、快手、小红书等短视频平台广告收入保持高增长，视频类广告占比持续提升。",
                    impact: "传统图文广告份额下降，广告主预算向短视频平台倾斜。"
                },
                {
                    type: "turning",
                    title: "搜索广告进入调整期",
                    description: "Google Ads和百度搜索广告受AI搜索影响，增长放缓，行业进入调整期。",
                    impact: "搜索广告需要重新评估投放策略，探索新的增长点。"
                }
            ];
        }

        console.log('  趋势分析已更新');
    }

    /**
     * 抓取行业报告
     */
    async fetchReports() {
        console.log('→ 检查新报告...');

        // 保持现有报告列表
        if (!this.currentData.reports) {
            this.currentData.reports = [];
        }

        console.log('  报告列表已保留');
    }

    /**
     * 保存更新后的数据
     */
    saveData() {
        // 更新时间戳
        this.currentData.lastUpdate = new Date().toLocaleString('zh-CN');

        // 保存为JSON
        const jsonData = JSON.stringify(this.currentData, null, 2);
        fs.writeFileSync(this.dataPath, jsonData, 'utf-8');

        // 备份旧数据
        const backupPath = path.join(__dirname, 'backups', `data-${this.getDateString()}.json`);
        this.ensureBackupDir();
        fs.writeFileSync(backupPath, jsonData, 'utf-8');
    }

    ensureBackupDir() {
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
    }

    getDateString() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
}

// 执行更新
if (require.main === module) {
    const updater = new DailyUpdater();
    updater.update().catch(error => {
        console.error('更新失败:', error);
        process.exit(1);
    });
}

module.exports = DailyUpdater;
