import { formatCategory, formatMetric, getChartSeries } from '../../utils/resultFormatting.js';

const COLORS = ['#1E3A8A', '#2563EB', '#60A5FA', '#93C5FD', '#0284C7', '#075985'];

export function chartFigure(chart) {
  const traces = buildTraces(chart);
  const values = getChartSeries(chart).flatMap((series) => series.values).map(Number).filter(Number.isFinite);
  const horizontal = chart.chart_type === 'horizontal_bar';
  const metricAxis = buildMetricAxis(values, `${chart.y_column || ''} ${chart.title || ''}`);

  return { data: traces, layout: {
          autosize: true,
          height: 292,
          margin: { l: horizontal ? 92 : 52, r: 18, t: 10, b: 82 },
          paper_bgcolor: '#FFFFFF',
          plot_bgcolor: '#FFFFFF',
          colorway: COLORS,
          showlegend: traces.length > 1 || ['pie', 'donut'].includes(chart.chart_type),
          legend: { orientation: 'h', x: 0, y: -0.22, font: { size: 9, color: '#6E6E73' } },
          font: { family: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif', size: 10, color: '#6E6E73' },
          hoverlabel: { bgcolor: '#1D1D1F', bordercolor: '#1D1D1F', font: { color: '#FFFFFF', size: 11 } },
          xaxis: { title: '', automargin: true, fixedrange: true, gridcolor: horizontal ? '#ECECEF' : 'rgba(0,0,0,0)', zerolinecolor: '#D2D2D7', tickfont: { size: 9 }, ...(horizontal ? metricAxis : {}) },
          yaxis: { title: '', automargin: true, fixedrange: true, gridcolor: horizontal ? 'rgba(0,0,0,0)' : '#ECECEF', zerolinecolor: '#D2D2D7', tickfont: { size: 9 }, ...(!horizontal && !['histogram', 'heatmap', 'pie', 'donut', 'waterfall'].includes(chart.chart_type) ? metricAxis : {}) },
          barmode: chart.chart_type === 'stacked_bar' ? 'stack' : 'group',
          bargap: 0.38,

  } };
}

function buildTraces(chart) {
  const config = chart.chart_config || {};
  const series = getChartSeries(chart);
  const metricHint = `${chart.y_column || ''} ${chart.title || ''}`;
  const type = chart.chart_type;

  if (type === 'heatmap' && Array.isArray(config.x) && Array.isArray(config.y) && Array.isArray(config.z)) {
    return [{ type: 'heatmap', x: config.x.map(formatCategory), y: config.y.map(formatCategory), z: config.z, colorscale: [[0, '#EFF6FF'], [1, '#2563EB']], showscale: true, hovertemplate: '%{y} · %{x}<br>%{z}<extra></extra>' }];
  }
  if (['pie', 'donut'].includes(type) && series[0]) {
    return [{ type: 'pie', labels: series[0].labels.map(formatCategory), values: series[0].values, hole: type === 'donut' ? 0.48 : 0, textinfo: 'label+percent', textfont: { size: 9 }, customdata: series[0].values.map((value) => formatMetric(value, metricHint)), hovertemplate: '%{label}<br>%{customdata} · %{percent}<extra></extra>', marker: { colors: COLORS } }];
  }
  if (type === 'histogram' && series[0]) {
    return [{ type: 'histogram', x: series[0].values, marker: { color: COLORS[0] }, hovertemplate: 'Range %{x}<br>Count %{y}<extra></extra>' }];
  }
  if (type === 'boxplot' && series[0]) {
    return [{ type: 'box', y: series[0].values, name: chart.y_column || 'Distribution', marker: { color: COLORS[0] }, boxpoints: 'outliers', hovertemplate: `%{y}<extra>${chart.y_column || 'Value'}</extra>` }];
  }
  if (type === 'waterfall' && series[0]) {
    return [{ type: 'waterfall', x: series[0].labels.map(formatCategory), y: series[0].values, customdata: series[0].values.map((value) => formatMetric(value, metricHint)), hovertemplate: '%{x}<br>%{customdata}<extra></extra>', increasing: { marker: { color: '#1E40AF' } }, decreasing: { marker: { color: '#60A5FA' } }, totals: { marker: { color: '#2563EB' } } }];
  }

  return series.map((item, index) => {
    const labels = item.labels.map(formatCategory);
    const formatted = item.values.map((value) => formatMetric(value, metricHint));
    if (type === 'line') return { type: 'scatter', mode: 'lines+markers', name: item.name, x: labels, y: item.values, customdata: formatted, line: { color: COLORS[index % COLORS.length], width: 2 }, marker: { size: 6 }, fill: series.length === 1 ? 'tozeroy' : undefined, fillcolor: series.length === 1 ? 'rgba(37,99,235,0.07)' : undefined, hovertemplate: '%{x}<br>%{customdata}<extra></extra>' };
    if (type === 'scatter') return { type: 'scatter', mode: 'markers', name: item.name, x: labels, y: item.values, customdata: formatted, marker: { color: COLORS[index % COLORS.length], size: 8, opacity: 0.78 }, hovertemplate: '%{x}<br>%{customdata}<extra></extra>' };
    if (type === 'horizontal_bar') return { type: 'bar', orientation: 'h', name: item.name, x: item.values, y: labels, customdata: formatted, marker: { color: series.length === 1 ? labels.map((_, position) => COLORS[position % COLORS.length]) : COLORS[index % COLORS.length] }, hovertemplate: '%{y}<br>%{customdata}<extra></extra>' };
    return { type: 'bar', name: item.name, x: labels, y: item.values, customdata: formatted, marker: { color: series.length === 1 ? labels.map((_, position) => COLORS[position % COLORS.length]) : COLORS[index % COLORS.length] }, hovertemplate: '%{x}<br>%{customdata}<extra></extra>' };
  });
}

function buildMetricAxis(values, hint) {
  if (!values.length) return {};
  const minimum = Math.min(...values, 0);
  const maximum = Math.max(...values, 0);
  if (minimum === maximum) return {};
  const ticks = minimum < 0 ? [minimum, 0, maximum] : [0, maximum * 0.25, maximum * 0.5, maximum * 0.75, maximum];
  return { tickmode: 'array', tickvals: ticks, ticktext: ticks.map((value) => formatMetric(value, hint)) };
}

