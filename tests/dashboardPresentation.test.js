import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardReport } from '../src/utils/dashboardReport.js';
import { deriveKpis } from '../src/utils/resultFormatting.js';

const charts = [{ id: 'region', chart_type: 'bar', x_column: 'Region', y_column: 'Revenue', title: 'Revenue by region', chart_config: { labels: ['North', 'East'], values: [1581500, 288000] } }];
test('KPI prioritizes the numeric metric and identifies its category', () => {
  const [kpi] = deriveKpis(charts);
  assert.equal(kpi.value, '₹15.81L');
  assert.equal(kpi.title, 'Revenue · North');
});
test('dashboard suppresses raw dumps and preserves caveats without inventing recommendations', () => {
  const report = dashboardReport({ key_findings: ['Revenue: 1; Spend: 2; Date: 3; Revenue: 4', 'Correlation does not establish causation.'], data_notes: ['Revenue has unusual values.'], limitations: [], recommendations: [] }, charts);
  assert.ok(report.key_findings.every((item) => !item.includes('Spend: 2')));
  assert.ok(report.context.some((item) => item.includes('causation')));
  assert.deepEqual(report.recommendations, []);
});
test('no chart evidence does not invent revenue recommendations', () => {
  assert.deepEqual(dashboardReport({}, []).recommendations, []);
});

test('dashboard and PDF presentation retain complete generated recommendations in order', () => {
  const recommendations = [
    'Review the sales mix in North because it leads revenue. Check the cost of those products before expanding stock.',
    'Investigate lower sales in East. Compare availability before trying a limited change.',
    'Check large orders in the peak period. Track whether demand continues.',
    'Review campaign costs before changing spend. Compare attributed sales and profit.',
  ];
  assert.deepEqual(dashboardReport({ recommendations }, charts).recommendations, recommendations);
});
