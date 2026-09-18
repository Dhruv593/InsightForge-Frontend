import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { formatCategory, formatMetric, getChartSeries } from '../../utils/resultFormatting';

const ChartRenderer = lazy(() => import('../charts/ChartRenderer').then((module) => ({ default: module.ChartRenderer })));

export function SupportingVisuals({ charts = [] }) {
  const visibleCharts = charts;
  const [selectedChart, setSelectedChart] = useState(null);
  if (!visibleCharts.length) return null;

  return (
    <section className="scroll-mt-5" aria-labelledby="supporting-visuals" id="analysis-visuals">
      <h2 className="mb-3 text-[13px] font-semibold text-[#1D1D1F]" id="supporting-visuals">Supporting visuals</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        {visibleCharts.map((chart, index) => (
          <Suspense fallback={<ChartSkeleton className={visibleCharts.length === 1 || (visibleCharts.length === 3 && index === 2) ? 'xl:col-span-2' : ''} />} key={chart.id}>
            <ChartRenderer chart={chart} onExpand={setSelectedChart} className={visibleCharts.length === 1 || (visibleCharts.length === 3 && index === 2) ? 'xl:col-span-2' : ''} />
          </Suspense>
        ))}
      </div>
      {selectedChart && <ChartDetail chart={selectedChart} onClose={() => setSelectedChart(null)} />}
    </section>
  );
}

function ChartDetail({ chart, onClose }) {
  const [view, setView] = useState('chart');
  const rows = useMemo(() => chartRows(chart), [chart]);

  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = ''; };
  }, [onClose]);

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" aria-labelledby="chart-detail-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl">
      <header className="flex items-center justify-between gap-4 border-b border-[#E5E5EA] px-4 py-3 sm:px-5"><div className="min-w-0"><h2 className="m-0 truncate text-sm font-semibold text-[#1D1D1F]" id="chart-detail-title">{chart.title}</h2><p className="mb-0 mt-0.5 text-[11px] text-[#86868B]">Explore the visual or inspect its values.</p></div><button className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-xl text-[#6E6E73] hover:bg-[#F2F2F4]" type="button" onClick={onClose} aria-label="Close chart">×</button></header>
      <div className="flex items-center justify-between border-b border-[#E5E5EA] px-4 py-2 sm:px-5"><div className="flex rounded-lg bg-[#F2F2F4] p-0.5"><ViewButton active={view === 'chart'} onClick={() => setView('chart')}>Chart</ViewButton><ViewButton active={view === 'data'} onClick={() => setView('data')}>Data</ViewButton></div><button className="rounded-lg border border-[#D2D2D7] bg-white px-3 py-1.5 text-[11px] font-medium text-[#3A3A3C] hover:bg-[#F7F7F8]" type="button" onClick={() => downloadCsv(chart, rows)}>Download data</button></div>
      <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-5">{view === 'chart' ? <Suspense fallback={<ChartSkeleton />}><ChartRenderer chart={chart} height="min(62vh, 560px)" showToolbar /></Suspense> : <ChartTable chart={chart} rows={rows} />}</div>
    </div>
  </div>;
}

function ViewButton({ active, onClick, children }) {
  return <button className={`rounded-md border-0 px-3 py-1.5 text-[11px] font-medium ${active ? 'bg-white text-[#1D1D1F] shadow-sm' : 'bg-transparent text-[#6E6E73]'}`} type="button" onClick={onClick}>{children}</button>;
}

function ChartTable({ chart, rows }) {
  if (!rows.length) return <p className="text-sm text-[#6E6E73]">No tabular values are available for this visual.</p>;
  const seriesNames = getChartSeries(chart).map((series) => series.name);
  return <div className="overflow-x-auto rounded-xl border border-[#E5E5EA]"><table className="w-full min-w-[480px] border-collapse text-left text-xs"><thead className="sticky top-0 bg-[#F7F7F8] text-[#515154]"><tr><th className="px-4 py-3 font-semibold">Category</th>{seriesNames.map((name) => <th className="px-4 py-3 text-right font-semibold" key={name}>{name}</th>)}</tr></thead><tbody>{rows.map((row) => <tr className="border-t border-[#ECECEF]" key={row.label}><td className="px-4 py-3 text-[#3A3A3C]">{formatCategory(row.label)}</td>{row.values.map((value, index) => <td className="px-4 py-3 text-right tabular-nums text-[#515154]" key={`${row.label}-${seriesNames[index]}`}>{formatMetric(value, `${seriesNames[index]} ${chart.title}`)}</td>)}</tr>)}</tbody></table></div>;
}

function chartRows(chart) {
  const series = getChartSeries(chart);
  const labels = [...new Set(series.flatMap((item) => item.labels))];
  return labels.map((label) => ({ label, values: series.map((item) => item.values[item.labels.indexOf(label)] ?? '') }));
}

function downloadCsv(chart, rows) {
  const names = getChartSeries(chart).map((series) => series.name);
  const csv = [['Category', ...names], ...rows.map((row) => [row.label, ...row.values])].map((row) => row.map(csvCell).join(',')).join('\n');
  const url = globalThis.URL.createObjectURL(new globalThis.Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${String(chart.title || 'chart-data').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}.csv`;
  link.click();
  globalThis.URL.revokeObjectURL(url);
}

function csvCell(value) {
  let text = String(value ?? '');
  // Spreadsheet applications can execute formulas embedded in imported CSV cells.
  // Preserve ordinary numbers while neutralizing formula-like text values.
  if (typeof value !== 'number' && /^[\t\r ]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function ChartSkeleton({ className }) {
  return <div className={`h-86 animate-pulse rounded-xl border border-[#E5E5EA] bg-white ${className}`} aria-label="Loading chart" />;
}
