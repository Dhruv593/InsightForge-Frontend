import { presentReport } from './reportLanguage.js';
import { formatCategory, formatMetric, getChartSeries, humanizeColumn } from './resultFormatting.js';

export function dashboardReport(raw, charts = []) {
  const report = presentReport(raw);
  const visualFindings = [];
  const suggestions = [];
  for (const chart of charts) {
    if (!['bar', 'horizontal_bar', 'donut', 'pie', 'line'].includes(chart.chart_type)) continue;
    const series = getChartSeries(chart);
    if (series.length !== 1) continue;
    const points = series[0].values.map((value, i) => ({ value: Number(value), label: series[0].labels[i] })).filter((item) => item.label != null && Number.isFinite(item.value));
    if (points.length < 2) continue;
    const measure = humanizeColumn(chart.y_column || 'Value');
    const top = points.reduce((a, b) => a.value >= b.value ? a : b);
    const bottom = points.reduce((a, b) => a.value <= b.value ? a : b);
    const hint = `${measure} ${chart.title}`;
    const total = points.reduce((sum, item) => sum + item.value, 0);
    const share = total > 0 ? `, representing ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format((top.value / total) * 100)}% of the displayed total` : '';
    visualFindings.push(`${formatCategory(top.label)} leads ${humanizeColumn(chart.x_column || 'this comparison')} at ${formatMetric(top.value, hint)}${share}; ${formatCategory(bottom.label)} is lowest at ${formatMetric(bottom.value, hint)}.`);
    if (/revenue|sales/i.test(measure)) suggestions.push(chart.chart_type === 'line'
      ? `Review the orders and campaigns behind ${formatCategory(top.label)} before treating its higher revenue as a repeatable trend.`
      : `Compare pricing, order volumes, and customer mix in ${formatCategory(top.label)} and ${formatCategory(bottom.label)} before choosing where to invest.`);
  }
  const isRaw = (text) => (text.match(/;/g) || []).length >= 2 || /first \d+ result rows|\d{4}-\d{2}-\d{2}T\d{2}:/.test(text);
  const caveat = (text) => /unusual|outlier|missing|blank entr|causat|causal|does not prove|do not prove|could not|cannot|skew|extreme|confidence interval|sample size|not included|imput|statistical significance|deterministic/i.test(text);
  const rawFindings = [...report.key_findings, ...report.statistical_findings];
  const narrative = rawFindings.filter((text) => !isRaw(text) && !caveat(text) && !/^here is|^your analysis|^however|^first,|^second,|^finally,/i.test(text));
  const summaryFindings = visualFindings.length + narrative.length < 3 && report.executive_summary
    ? report.executive_summary.split(/(?<=[.!?])\s+/).filter((text) => text.length >= 30 && !caveat(text))
    : [];
  return { ...report,
    key_findings: [...new Set([...visualFindings, ...narrative, ...summaryFindings])].slice(0, 8),
    recommendations: report.recommendations.length ? report.recommendations.slice(0, 4) : [...new Set(suggestions)].slice(0, 3),
    context: [...new Set([...report.data_notes, ...report.limitations, ...rawFindings.filter(caveat)])],
  };
}
