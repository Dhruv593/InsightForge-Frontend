import assert from 'node:assert/strict';
import test from 'node:test';
import { reportBullets, plainLanguage, presentReport, reportRecommendations } from '../src/utils/reportLanguage.js';
import { chartFigure } from '../src/components/charts/chartFigure.js';

test('findings split into sentences without splitting decimal amounts', () => {
  assert.deepEqual(reportBullets(['North earned 1581500.0. South earned 306500.0.']), ['North earned 1581500.0.', 'South earned 306500.0.']);
});

test('technical notes explain unusual values and retain meaningful warnings', () => {
  assert.equal(plainLanguage("Column 'Revenue' contains values outside the 1.5×IQR bounds."), 'Revenue includes unusually high or low values compared with most records.');
  assert.ok(plainLanguage('The language-model interpretation was unavailable, so only deterministic output metadata is summarized.').includes('Some explanations could not be prepared'));
});

test('recommendations keep the action, reason and success check in one item', () => {
  const first = 'Review East\'s product mix because it has the highest revenue. Compare costs before extending the approach.';
  const second = 'Check the weakest period for one-off delays. Track sales after resolving any confirmed issue.';
  assert.deepEqual(reportRecommendations([`1. ${first}`, '', first, `2. ${second}`]), [first, second]);
  assert.deepEqual(presentReport({ recommendations: [first, second] }).recommendations, [first, second]);
});

test('legacy midnight timestamps become readable dates without changing the calendar day', () => {
  assert.equal(plainLanguage('Review the strongest period (2025-10-31T00:00:00).'), 'Review the strongest period (31 October 2025).');
  assert.equal(plainLanguage('Review 2025-10-31T00:00:00.000Z and 2026-01-31T00:00:00+00:00.'), 'Review 31 October 2025 and 31 January 2026.');
  assert.equal(plainLanguage('2025-02-31T00:00:00'), '2025-02-31T00:00:00');
  assert.equal(plainLanguage('2025-10-31T14:30:00+05:30'), '2025-10-31T14:30:00+05:30');
  assert.equal(plainLanguage('2025-10-31T00:00:00+05:30'), '2025-10-31T00:00:00+05:30');
});

test('shared screen/PDF figure preserves pie, donut, and line types', () => {
  const chart = { title: 'Revenue by region', y_column: 'Revenue', chart_config: { labels: ['North', 'South'], values: [100, 80] } };
  const pie = chartFigure({ ...chart, chart_type: 'pie' });
  assert.equal(pie.data[0].type, 'pie');
  assert.equal(pie.layout.showlegend, true);
  assert.equal(new Set(pie.data[0].marker.colors).size, 6);
  assert.equal(chartFigure({ ...chart, chart_type: 'donut' }).data[0].hole, 0.48);
  assert.equal(chartFigure({ ...chart, chart_type: 'line' }).data[0].mode, 'lines+markers');
});
