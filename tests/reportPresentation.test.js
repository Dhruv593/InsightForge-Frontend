import assert from 'node:assert/strict';
import test from 'node:test';
import { reportBullets, plainLanguage } from '../src/utils/reportLanguage.js';
import { chartFigure } from '../src/components/charts/chartFigure.js';

test('findings split into sentences without splitting decimal amounts', () => {
  assert.deepEqual(reportBullets(['North earned 1581500.0. South earned 306500.0.']), ['North earned 1581500.0.', 'South earned 306500.0.']);
});

test('technical notes explain unusual values and retain meaningful warnings', () => {
  assert.equal(plainLanguage("Column 'Revenue' contains values outside the 1.5×IQR bounds."), 'Revenue includes unusually high or low values compared with most records.');
  assert.ok(plainLanguage('The language-model interpretation was unavailable, so only deterministic output metadata is summarized.').includes('Some explanations could not be prepared'));
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
