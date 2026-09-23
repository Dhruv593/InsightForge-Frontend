import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
import { useEffect, useRef } from 'react';
import { chartFigure } from './chartFigure';

const Plot = createPlotlyComponent(Plotly);

export function ChartRenderer({ chart, className = '', height = '292px', onExpand, showToolbar = false }) {
  const container = useRef(null);
  const plot = useRef(null);
  useEffect(() => {
    if (!container.current || !window.ResizeObserver) return undefined;
    const observer = new window.ResizeObserver(() => {
      if (plot.current) Plotly.Plots.resize(plot.current).catch(() => {});
    });
    observer.observe(container.current);
    return () => { observer.disconnect(); plot.current = null; };
  }, []);
  const figure = chartFigure(chart);
  if (!figure.data.length) return <div className="rounded-xl border border-[#E5E5EA] bg-white p-5 text-xs text-[#6E6E73]">The saved chart does not contain renderable values.</div>;
  return (
    <figure ref={container} className={`m-0 min-w-0 overflow-hidden rounded-xl border border-[#E5E5EA] bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 px-3 pb-0.5 pt-2.5 sm:px-4 sm:pb-1 sm:pt-3.5"><h3 className="m-0 truncate text-[12px] font-semibold text-[#1D1D1F]">{chart.title}</h3>{onExpand && <button className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-0 bg-transparent text-[#6E6E73] transition hover:bg-[#F2F2F4] hover:text-[#1D1D1F] sm:h-8 sm:w-8 sm:rounded-lg" type="button" onClick={() => onExpand(chart)} aria-label={`Expand ${chart.title}`} title="Expand chart"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg></button>}</div>
      <Plot onInitialized={(_, graph) => { plot.current = graph; }} onUpdate={(_, graph) => { plot.current = graph; }} data={figure.data} layout={{ ...figure.layout, height: undefined }} config={{ responsive: true, displaylogo: false, displayModeBar: showToolbar, modeBarButtonsToRemove: showToolbar ? ['select2d', 'lasso2d', 'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d'] : undefined, scrollZoom: false, toImageButtonOptions: { format: 'png', filename: chart.title || 'tatparya-chart', scale: 2 } }} style={{ width: '100%', height }} useResizeHandler />
    </figure>
  );
}
