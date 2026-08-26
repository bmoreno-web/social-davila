/**
 * Dynamic Dashboard & Metrics Charts with Chart.js
 */
let reachChart = null;
let platformChart = null;
let engagementChart = null;

function isDarkMode() {
    return document.documentElement.classList.contains('dark');
}

function getChartColors() {
    const dark = isDarkMode();
    return {
        textColor: dark ? '#9ca3af' : '#64748b',
        gridColor: dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        tooltipBg: dark ? '#1f2937' : '#ffffff',
        tooltipText: dark ? '#f9fafb' : '#0f172a',
        tooltipBorder: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };
}

function initDashboardCharts(data) {
    const colors = getChartColors();

    // 1. Reach & Impressions Chart (Line / Bar)
    const reachCtx = document.getElementById('reachChart');
    if (reachCtx) {
        if (reachChart) reachChart.destroy();
        
        const labels = data?.dates || ['1 Ago', '5 Ago', '10 Ago', '15 Ago', '20 Ago', '25 Ago', '30 Ago'];
        const reachData = data?.reach || [14200, 18500, 24100, 21900, 31400, 28900, 39800];
        const impressionsData = data?.impressions || [21000, 27800, 36500, 32400, 48200, 44100, 58300];

        reachChart = new Chart(reachCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Impresiones Totales',
                        data: impressionsData,
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.12)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Alcance Único',
                        data: reachData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: colors.textColor, font: { family: 'Inter', size: 12 } }
                    },
                    tooltip: {
                        backgroundColor: colors.tooltipBg,
                        titleColor: colors.tooltipText,
                        bodyColor: colors.tooltipText,
                        borderColor: colors.tooltipBorder,
                        borderWidth: 1,
                        padding: 10
                    }
                },
                scales: {
                    x: {
                        grid: { color: colors.gridColor },
                        ticks: { color: colors.textColor, font: { family: 'Inter' } }
                    },
                    y: {
                        grid: { color: colors.gridColor },
                        ticks: {
                            color: colors.textColor,
                            font: { family: 'Inter' },
                            callback: function(val) {
                                return val >= 1000 ? (val / 1000) + 'k' : val;
                            }
                        }
                    }
                }
            }
        });
    }

    // 2. Platform Distribution (Doughnut)
    const platCtx = document.getElementById('platformChart');
    if (platCtx) {
        if (platformChart) platformChart.destroy();

        platformChart = new Chart(platCtx, {
            type: 'doughnut',
            data: {
                labels: ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube'],
                datasets: [{
                    data: data?.platforms || [45, 25, 15, 10, 5],
                    backgroundColor: [
                        '#E1306C', // Instagram
                        '#1877F2', // Facebook
                        '#00f2fe', // TikTok
                        '#0A66C2', // LinkedIn
                        '#FF0000'  // YouTube
                    ],
                    borderWidth: isDarkMode() ? 2 : 1,
                    borderColor: isDarkMode() ? '#111827' : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: colors.textColor, font: { family: 'Inter', size: 11 }, padding: 14 }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

// Listen to theme switch to re-render charts cleanly
window.addEventListener('themeChanged', () => {
    initDashboardCharts();
});
