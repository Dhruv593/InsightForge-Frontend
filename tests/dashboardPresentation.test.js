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
test('dashboard suppresses raw dumps, preserves caveats, and suggests cautious actions', () => {
  const report = dashboardReport({ key_findings: ['Revenue: 1; Spend: 2; Date: 3; Revenue: 4', 'Correlation does not establish causation.'], data_notes: ['Revenue has unusual values.'], limitations: [], recommendations: [] }, charts);
  assert.ok(report.key_findings.every((item) => !item.includes('Spend: 2')));
  assert.ok(report.context.some((item) => item.includes('causation')));
  assert.ok(report.recommendations[0].includes('North'));
  assert.ok(report.recommendations[0].includes('before'));
});
test('no chart evidence does not invent revenue recommendations', () => {
  assert.deepEqual(dashboardReport({}, []).recommendations, []);
});
