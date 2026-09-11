import { deriveKpis } from '../../utils/resultFormatting';

export function KPIGrid({ charts }) {
  const kpis = deriveKpis(charts);
  if (!kpis.length) return null;

  return (
    <section aria-label="Key performance indicators">
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {kpis.map((kpi) => (
          <article className="min-w-0 rounded-xl border border-[#E5E5EA] bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.025)]" key={kpi.title} title={kpi.exactValue}>
            <p className="m-0 text-[11px] font-medium text-[#6E6E73]">{kpi.title}</p>
            <p className="mb-0 mt-1 truncate text-xl font-semibold tracking-[-0.025em] text-[#1D1D1F]">{kpi.value}</p>
            <p className="mb-0 mt-1 truncate text-[11px] text-[#86868B]">{kpi.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
