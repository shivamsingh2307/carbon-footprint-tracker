/**
 * ChartManager — Chart.js wrapper for creating and updating charts.
 * @module ChartManager
 */

/** Store active chart instances for cleanup. */
const charts = new Map();

/** Lazy-loaded Chart.js constructor (avoids blocking app boot). */
let chartModulePromise = null;

/**
 * Load Chart.js on demand so the rest of the app can render without it.
 * @returns {Promise<typeof import('chart.js').Chart>}
 */
async function loadChartJs() {
  if (!chartModulePromise) {
    chartModulePromise = import('chart.js')
      .then(({ Chart, registerables }) => {
        Chart.register(...registerables);
        return Chart;
      })
      .catch((error) => {
        chartModulePromise = null;
        throw error;
      });
  }
  return chartModulePromise;
}

/**
 * Get default font and color config that matches the current theme.
 * @returns {Object}
 */
function getThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    textColor: style.getPropertyValue('--text-secondary').trim() || '#94a3b8',
    gridColor: style.getPropertyValue('--border-secondary').trim() || 'rgba(148,163,184,0.08)',
    accentColor: style.getPropertyValue('--accent-primary').trim() || '#10b981',
    fontFamily: style.getPropertyValue('--font-family').trim() || 'Inter, sans-serif',
  };
}

/**
 * Create or update a doughnut chart.
 * @param {string} canvasId - Canvas element ID
 * @param {Object} data - { labels: string[], values: number[], colors: string[] }
 * @returns {Chart}
 */
export function createDoughnutChart(canvasId, { labels, values, colors }) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  loadChartJs()
    .then((Chart) => {
      if (!document.getElementById(canvasId)) return;

      const theme = getThemeColors();
      const ctx = canvas.getContext('2d');

      const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: 'transparent',
        borderWidth: 0,
        hoverBorderWidth: 3,
        hoverBorderColor: 'rgba(255,255,255,0.3)',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme.textColor,
            font: { family: theme.fontFamily, size: 12 },
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          titleFont: { family: theme.fontFamily, weight: 600 },
          bodyFont: { family: theme.fontFamily },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${value.toFixed(1)} kg (${pct}%)`;
            },
          },
        },
      },
    },
      });

      charts.set(canvasId, chart);
    })
    .catch((error) => {
      console.warn('[ChartManager] Doughnut chart unavailable:', error);
    });

  return null;
}

/**
 * Create or update a line chart for trends.
 * @param {string} canvasId
 * @param {Object} data - { labels: string[], values: number[] }
 * @returns {Chart}
 */
export function createLineChart(canvasId, { labels, values }) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  loadChartJs()
    .then((Chart) => {
      if (!document.getElementById(canvasId)) return;

      const theme = getThemeColors();
      const ctx = canvas.getContext('2d');

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'CO₂e (kg)',
        data: values,
        borderColor: theme.accentColor,
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: theme.accentColor,
        pointBorderColor: 'transparent',
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
        pointHoverBorderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: theme.textColor,
            font: { family: theme.fontFamily, size: 11 },
            maxRotation: 0,
          },
          border: { display: false },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: theme.gridColor,
            drawBorder: false,
          },
          ticks: {
            color: theme.textColor,
            font: { family: theme.fontFamily, size: 11 },
            callback: (value) => `${value} kg`,
          },
          border: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          titleFont: { family: theme.fontFamily, weight: 600 },
          bodyFont: { family: theme.fontFamily },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y.toFixed(2)} kg CO₂e`,
          },
        },
      },
    },
      });

      charts.set(canvasId, chart);
    })
    .catch((error) => {
      console.warn('[ChartManager] Line chart unavailable:', error);
    });

  return null;
}

/**
 * Create a horizontal bar chart.
 * @param {string} canvasId
 * @param {Object} data - { labels: string[], values: number[], colors: string[] }
 * @returns {Chart}
 */
export function createBarChart(canvasId, { labels, values, colors }) {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  loadChartJs()
    .then((Chart) => {
      if (!document.getElementById(canvasId)) return;

      const theme = getThemeColors();
      const ctx = canvas.getContext('2d');

      const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 40,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: {
          grid: { color: theme.gridColor },
          ticks: {
            color: theme.textColor,
            font: { family: theme.fontFamily, size: 11 },
            callback: (v) => `${v} kg`,
          },
          border: { display: false },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: theme.textColor,
            font: { family: theme.fontFamily, size: 12, weight: 500 },
          },
          border: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 12,
          cornerRadius: 8,
        },
      },
    },
      });

      charts.set(canvasId, chart);
    })
    .catch((error) => {
      console.warn('[ChartManager] Bar chart unavailable:', error);
    });

  return null;
}

/**
 * Destroy a chart instance.
 * @param {string} canvasId
 */
export function destroyChart(canvasId) {
  const existing = charts.get(canvasId);
  if (existing) {
    existing.destroy();
    charts.delete(canvasId);
  }
}

/**
 * Destroy all chart instances.
 */
export function destroyAllCharts() {
  charts.forEach((chart) => chart.destroy());
  charts.clear();
}
