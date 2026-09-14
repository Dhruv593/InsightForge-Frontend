export function getChartSeries(chart) {
  const config = chart?.chart_config || {};
  if (Array.isArray(config.series)) {
    return config.series.map((series) => ({
      name: String(series.name || 'Series'),
      labels: series.labels || [],
      values: series.values || [],
    }));
  }
  if (Array.isArray(config.labels) && Array.isArray(config.values)) {
    return [{ name: chart?.y_column || 'Value', labels: config.labels, values: config.values }];
  }
  if (Array.isArray(config.values)) {
    return [{
      name: config.value_column || chart?.y_column || 'Value',
      labels: config.values.map((_, index) => `Observation ${index + 1}`),
      values: config.values,
    }];
  }
  return [];
}

export function deriveKpis(charts = []) {
  const kpis = [];
  const usedTitles = new Set();

  for (const chart of charts) {
    if (kpis.length === 4) break;
    if (['histogram', 'boxplot', 'heatmap', 'scatter'].includes(chart.chart_type)) continue;
    const candidates = getChartSeries(chart).flatMap((series) => series.values.map((rawValue, index) => ({
      label: series.labels[index],
      value: Number(rawValue),
    }))).filter((item) => Number.isFinite(item.value));
    if (!candidates.length) continue;

    const strongest = candidates.reduce((best, item) => item.value > best.value ? item : best);
    const dimension = humanizeColumn(chart.x_column || 'category');
    const measure = humanizeColumn(chart.y_column || 'value');
    const singleTotal = candidates.length === 1 && /total/i.test(chart.title || '');
    const title = singleTotal ? chart.title : `${chart.chart_type === 'line' ? 'Peak' : 'Top'} ${singularize(dimension)}`;
    if (usedTitles.has(title)) continue;

    usedTitles.add(title);
    kpis.push({
      title: singleTotal ? title : `${measure} · ${formatCategory(strongest.label)}`,
      value: formatMetric(strongest.value, `${measure} ${chart.title}`),
      detail: singleTotal ? formatCategory(strongest.label) : formatMetric(strongest.value, `${measure} ${chart.title}`),
      exactValue: formatExactMetric(strongest.value, `${measure} ${chart.title}`),
    });
  }

  return kpis;
}

export function formatMetric(value, hint = '') {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value ?? '—');
  if (isCurrency(hint)) return formatInrCompact(numeric);
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    notation: Math.abs(numeric) >= 1_000_000 ? 'compact' : 'standard',
  }).format(numeric);
}

export function formatExactMetric(value, hint = '') {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value ?? '—');
  return new Intl.NumberFormat('en-IN', {
    style: isCurrency(hint) ? 'currency' : 'decimal',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatCategory(value) {
  if (value === null || value === undefined || value === '') return '—';
  const text = String(value);
  if (/^\d{4}-\d{2}(-\d{2})?(T.*)?$/.test(text)) {
    const date = new Date(text.length === 7 ? `${text}-01T00:00:00` : text);
    if (!Number.isNaN(date.getTime())) return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(date);
  }
  return text;
}

export function humanizeColumn(value) {
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function isCurrency(hint = '') {
  return /(revenue|sales|amount|price|cost|profit|spend|income|value)/i.test(hint);
}

function formatInrCompact(value) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (absolute >= 10_000_000) return `${sign}₹${trimZeros(absolute / 10_000_000)}Cr`;
  if (absolute >= 100_000) return `${sign}₹${trimZeros(absolute / 100_000)}L`;
  if (absolute >= 1_000) return `${sign}₹${trimZeros(absolute / 1_000)}K`;
  return `${sign}₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(absolute)}`;
}

function trimZeros(value) {
  return value.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

function singularize(value) {
  return value.endsWith('s') ? value.slice(0, -1) : value;
}
