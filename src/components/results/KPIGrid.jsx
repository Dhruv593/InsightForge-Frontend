import { deriveKpis } from '../../utils/resultFormatting';

export function KPIGrid({ charts }) {
  const kpis = deriveKpis(charts);
  if (!kpis.length) return null;

  return (
    <section aria-label="Key performance indicators">
      <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 2xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <article className={`min-w-0 rounded-xl border border-[#E5E5EA] bg-white px-3 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.025)] sm:px-4 sm:py-3.5 ${kpis.length % 2 === 1 && index === kpis.length - 1 ? 'min-[360px]:col-span-2 sm:col-span-1' : ''}`} key={kpi.title} title={kpi.exactValue}>
            <p className="m-0 text-[11px] font-medium text-[#6E6E73]">{kpi.title}</p>
            <p className="mb-0 mt-1 truncate text-lg font-semibold tracking-[-0.025em] text-[#1D1D1F] sm:text-xl">{kpi.value}</p>

          </article>
        ))}
      </div>
    </section>
  );
}
