import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';
import { useEffect, useRef } from 'react';
import { chartFigure } from './chartFigure';

const Plot = createPlotlyComponent(Plotly);

export function ChartRenderer({ chart, className = '' }) {
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
      <div className="px-4 pb-1 pt-3.5"><h3 className="m-0 text-[12px] font-semibold text-[#1D1D1F]">{chart.title}</h3></div>
      <Plot onInitialized={(_, graph) => { plot.current = graph; }} onUpdate={(_, graph) => { plot.current = graph; }} data={figure.data} layout={figure.layout} config={{ responsive: true, displaylogo: false, displayModeBar: false, scrollZoom: false }} style={{ width: '100%', height: '292px' }} useResizeHandler />
    </figure>
  );
}
