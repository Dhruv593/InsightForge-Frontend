import { KPIGrid } from './KPIGrid';
import { SupportingVisuals } from './SupportingVisuals';
import { dashboardReport } from '../../utils/dashboardReport';

export function AnalysisResult({ report, charts = [] }) {
  if (!report) return null;
  const content = dashboardReport(report, charts);
  return <div className="grid gap-5 pb-3" aria-label="Analysis dashboard">
    <nav className="sticky top-0 z-10 -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-[#E5E5EA] bg-white/90 p-1 shadow-sm backdrop-blur-md" aria-label="Analysis sections"><SectionLink href="#analysis-overview">Overview</SectionLink>{charts.length > 0 && <SectionLink href="#analysis-visuals">Visuals</SectionLink>}<SectionLink href="#analysis-findings">Findings</SectionLink><SectionLink href="#analysis-recommendations">Recommendations</SectionLink></nav>
    <div className="scroll-mt-5" id="analysis-overview"><KPIGrid charts={charts} /></div>
    <SupportingVisuals charts={charts} />
    {!content.key_findings.length && <p className="text-sm leading-6 text-slate-600">{content.executive_summary}</p>}
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="scroll-mt-5 rounded-xl border border-slate-200 bg-white p-5" id="analysis-findings"><h2 className="mb-3 mt-0 text-sm font-semibold">Key findings</h2><ul className="m-0 grid list-disc gap-3 pl-4 text-[13px] leading-6 text-slate-600 marker:text-indigo-500">{content.key_findings.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="scroll-mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-5" id="analysis-recommendations"><h2 className="mb-1 mt-0 text-sm font-semibold">Recommendations</h2>{content.recommendations.length ? <ol className="m-0 grid list-decimal gap-3 pl-4 text-[13px] leading-6 text-slate-700">{content.recommendations.map((item) => <li key={item}>{item}</li>)}</ol> : <p className="text-sm leading-6 text-slate-600">There isn’t enough verified evidence yet to recommend a revenue action.</p>}</section>
    </div>
  </div>;
}

function SectionLink({ href, children }) {
  return <a className="shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#6E6E73] no-underline transition hover:bg-[#F2F2F4] hover:text-[#1D1D1F]" href={href}>{children}</a>;
}
