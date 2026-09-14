import { lazy, Suspense } from 'react';

const ChartRenderer = lazy(() => import('../charts/ChartRenderer').then((module) => ({ default: module.ChartRenderer })));

export function SupportingVisuals({ charts = [] }) {
  const visibleCharts = charts;
  if (!visibleCharts.length) return null;

  return (
    <section aria-labelledby="supporting-visuals">
      <h2 className="mb-3 text-[13px] font-semibold text-[#1D1D1F]" id="supporting-visuals">Supporting visuals</h2>
      <div className="grid gap-4 xl:grid-cols-2">
        {visibleCharts.map((chart, index) => (
          <Suspense fallback={<ChartSkeleton className={visibleCharts.length === 1 || (visibleCharts.length === 3 && index === 2) ? 'xl:col-span-2' : ''} />} key={chart.id}>
            <ChartRenderer chart={chart} className={visibleCharts.length === 1 || (visibleCharts.length === 3 && index === 2) ? 'xl:col-span-2' : ''} />
          </Suspense>
        ))}
      </div>
    </section>
  );
}

function ChartSkeleton({ className }) {
  return <div className={`h-86 animate-pulse rounded-xl border border-[#E5E5EA] bg-white ${className}`} aria-label="Loading chart" />;
}
