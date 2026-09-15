// 广告行业竞品监测平台 - 主应用
class AdMonitorPlatform {
    constructor() {
        this.data = null;
        this.currentTab = 'domestic';
        this.currentPlatform = 'all';
        this.currentType = 'all';
        this.charts = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderAll();
        this.attachEventListeners();
    }

    async loadData() {
        try {
            const response = await fetch('data.json');
            this.data = await response.json();
            this.updateLastUpdateTime();
        } catch (error) {
            console.error('加载数据失败:', error);
            this.data = this.getDefaultData();
        }
    }

    updateLastUpdateTime() {
        const lastUpdate = document.getElementById('lastUpdate');
        if (this.data && this.data.lastUpdate) {
            lastUpdate.textContent = `最后更新: ${this.data.lastUpdate}`;
        }
    }

    renderAll() {
        this.renderTrends();
        this.renderDataOverview();
        this.renderCharts();
        this.renderUpdates();
        this.renderReports();
    }

    // 渲染趋势
    renderTrends() {
        const container = document.getElementById('trendsContainer');
        if (!this.data || !this.data.trends) return;

        container.innerHTML = this.data.trends.map(trend => `
            <div class="trend-card">
                <h3>
                    <span class="trend-badge ${trend.type}">${this.getTrendTypeText(trend.type)}</span>
                    ${trend.title}
                </h3>
                <div class="trend-desc">${trend.description}</div>
                <div class="trend-impact"><strong>影响分析：</strong>${trend.impact}</div>
            </div>
        `).join('');
    }

    getTrendTypeText(type) {
        const typeMap = {
            'new': '新变化',
            'continue': '延续',
            'turning': '转折'
        };
        return typeMap[type] || type;
    }

    // 渲染数据概览
    renderDataOverview() {
        if (!this.data || !this.data.overview) return;

        const overview = this.data.overview;

        // 市场规模
        document.getElementById('marketSize').textContent = overview.marketSize.value;
        this.setChangeClass('marketChange', overview.marketSize.change, overview.marketSize.changeText);

        // eCPM
        document.getElementById('ecpmAvg').textContent = overview.ecpm.value;
        this.setChangeClass('ecpmChange', overview.ecpm.change, overview.ecpm.changeText);

        // AI占比
        document.getElementById('aiRatio').textContent = overview.aiRatio.value;
        this.setChangeClass('aiChange', overview.aiRatio.change, overview.aiRatio.changeText);

        // 移动端占比
        document.getElementById('mobileRatio').textContent = overview.mobileRatio.value;
        this.setChangeClass('mobileChange', overview.mobileRatio.change, overview.mobileRatio.changeText);
    }

    setChangeClass(elementId, change, text) {
        const element = document.getElementById(elementId);
        element.textContent = text;
        element.className = 'stat-change';
        if (change > 0) {
            element.classList.add('positive');
        } else if (change < 0) {
            element.classList.add('negative');
        } else {
            element.classList.add('neutral');
        }
    }

    // 渲染图表
    renderCharts() {
        if (!this.data) return;

        // 市场份额饼图
        this.renderMarketShareChart();

        // eCPM趋势线图
        this.renderEcpmTrendChart();
    }

    renderMarketShareChart() {
        const ctx = document.getElementById('marketShareChart');
        if (this.charts.marketShare) {
            this.charts.marketShare.destroy();
        }

        const data = this.data.marketShare || [];

        this.charts.marketShare = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.platform),
                datasets: [{
                    data: data.map(item => item.share),
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#4facfe',
                        '#43e97b',
                        '#fa709a',
                        '#fee140',
                        '#30cfd0',
                        '#a8edea'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    renderEcpmTrendChart() {
        const ctx = document.getElementById('ecpmTrendChart');
        if (this.charts.ecpmTrend) {
            this.charts.ecpmTrend.destroy();
        }

        const data = this.data.ecpmTrend || [];

        this.charts.ecpmTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.month),
                datasets: [{
                    label: '平均eCPM (¥)',
                    data: data.map(item => item.value),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    // 渲染平台动态
    renderUpdates() {
        const container = document.getElementById('updatesContainer');
        if (!this.data || !this.data.updates) return;

        let filteredUpdates = this.filterUpdates();

        if (filteredUpdates.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 40px;">暂无符合条件的动态</p>';
            return;
        }

        container.innerHTML = filteredUpdates.map(update => `
            <div class="update-item">
                <div class="update-header">
                    <div class="update-platform">${update.platform}</div>
                    <div class="update-meta">
                        <span class="update-type ${update.changeType}">${this.getChangeTypeText(update.changeType)}</span>
                        <span>${update.date}</span>
                    </div>
                </div>
                <div class="update-content">${update.content}</div>
                <div class="update-impact">
                    ${update.impacts.map(impact => `<span class="impact-tag">${impact}</span>`).join('')}
                </div>
                ${update.source ? `<div class="update-source">来源: <a href="${update.source}" target="_blank">查看详情</a></div>` : ''}
            </div>
        `).join('');
    }

    filterUpdates() {
        let updates = [...this.data.updates];

        // 按地区标签过滤
        if (this.currentTab === 'domestic') {
            updates = updates.filter(u => u.region === 'domestic');
        } else if (this.currentTab === 'overseas') {
            updates = updates.filter(u => u.region === 'overseas');
        }

        // 按平台过滤
        if (this.currentPlatform !== 'all') {
            updates = updates.filter(u => u.platformId === this.currentPlatform);
        }

        // 按类型过滤
        if (this.currentType !== 'all') {
            updates = updates.filter(u => u.changeType === this.currentType);
        }

        return updates;
    }

    getChangeTypeText(type) {
        const typeMap = {
            'product': '产品更新',
            'strategy': '策略调整',
            'data': '数据变化',
            'financial': '财报信息'
        };
        return typeMap[type] || type;
    }

    // 渲染报告
    renderReports() {
        const container = document.getElementById('reportsContainer');
        if (!this.data || !this.data.reports) return;

        container.innerHTML = this.data.reports.map(report => `
            <div class="report-card">
                <div class="report-header">
                    <div class="report-org">${report.organization}</div>
                    <div class="report-date">${report.date}</div>
                </div>
                <div class="report-title">${report.title}</div>
                <div class="report-summary">${report.summary}</div>
                <a href="${report.link}" target="_blank" class="report-link">查看报告 →</a>
            </div>
        `).join('');
    }

    // 事件监听
    attachEventListeners() {
        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refresh();
        });

        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTab = e.target.dataset.tab;
                this.renderUpdates();
            });
        });

        // 平台筛选
        document.getElementById('platformSelect').addEventListener('change', (e) => {
            this.currentPlatform = e.target.value;
            this.renderUpdates();
        });

        // 类型筛选
        document.getElementById('changeTypeSelect').addEventListener('change', (e) => {
            this.currentType = e.target.value;
            this.renderUpdates();
        });
    }

    async refresh() {
        const btn = document.getElementById('refreshBtn');
        btn.textContent = '更新中...';
        btn.disabled = true;

        await this.loadData();
        this.renderAll();

        setTimeout(() => {
            btn.textContent = '刷新数据';
            btn.disabled = false;
        }, 1000);
    }

    // 默认数据（当无法加载data.json时使用）
    getDefaultData() {
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
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AdMonitorPlatform();
});
