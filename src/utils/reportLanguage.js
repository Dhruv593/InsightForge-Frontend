// Presentation only: preserve saved evidence and numbers, and explain caveats plainly.
export function plainLanguage(value) {
  return String(value || '')
    .replace(/This report was assembled deterministically from saved evidence and accepted claims\.?/gi, '')
    .replace(/The language-model interpretation was unavailable[^.]*\.?/gi, 'Some explanations could not be prepared. The available calculated results are shown.')
    .replace(/Column ['"]([^'"]+)['"] contains values outside the [^\n]*?(?:IQR bounds|interquartile range bounds)\.?/gi, '$1 includes unusually high or low values compared with most records.')
    .replace(/(\d+) potential (.*?) outliers were retained(?:; no automatic removal was applied| without automatic removal| and no automatic removal was applied during the analysis)?\.?/gi, '$1 unusually high or low $2 values were kept in the analysis.')
    .replace(/(\d+\.\d+)\s*(percent|%)/gi, (_, value, unit) => `${Number(value).toFixed(2)}${unit === '%' ? '%' : ' percent'}`)
    .replace(/missing values/gi, 'blank entries')
    .replace(/exact duplicate rows/gi, 'repeated records')
    .replace(/outliers/gi, 'unusually high or low values')
    .replace(/observational analysis cannot establish causality/gi, 'These results show patterns, but do not prove what caused them')
    .replace(/do not imply causation from correlation/gi, 'do not prove that one factor caused another')
    .replace(/aggregated time-series data/gi, 'totals for each time period')
    .replace(/regional revenue aggregation/gi, 'revenue totals by region')
    .replace(/provided tool result/gi, 'available results')
    .replace(/deterministic output metadata/gi, 'calculated results')
    .replace(/observational limitations/gi, 'limits of the available data')
    .replace(/causal variables/gi, 'information about possible causes')
    .replace(/_/g, ' ')
    .trim();
}

export function reportBullets(items = []) {
  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  const bullets = items.flatMap((item) => {
    const text = plainLanguage(typeof item === 'string' ? item : item?.finding);
    return text.split(/\n+/).flatMap((line) => Array.from(segmenter.segment(line), ({ segment }) => segment.replace(/^\s*(?:[-•]|\d+[.)])\s+/, '').trim()));
  }).filter(Boolean);
  return [...new Set(bullets)];
}

export function presentReport(report) {
  return {
    ...report,
    executive_summary: plainLanguage(report.executive_summary),
    key_findings: reportBullets(report.key_findings),
    statistical_findings: reportBullets(report.statistical_findings),
    data_notes: reportBullets(report.data_notes),
    limitations: reportBullets(report.limitations),
    recommendations: reportBullets(report.recommendations),
  };
}
