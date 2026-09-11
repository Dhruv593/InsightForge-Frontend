import { KPIGrid } from './KPIGrid';
import { SupportingVisuals } from './SupportingVisuals';
import { presentReport } from '../../utils/reportLanguage';

export function AnalysisResult({ report, charts = [] }) {
  if (!report) return null;
  report = presentReport(report);
  const findings = (report.key_findings || []).map((item) => typeof item === 'string' ? item : item.finding).filter(Boolean);
  const showSummary = !findings.length && report.executive_summary;

  return (
    <div className="grid gap-6 pb-3" aria-label="Analysis result">
      <KPIGrid charts={charts} />
      <SupportingVisuals charts={charts} />
      {showSummary && <TextBlock title="Summary"><p className="m-0 text-[13px] leading-6 text-[#515154]">{report.executive_summary}</p></TextBlock>}
      {findings.length > 0 && <ResultSection title="Key findings" items={findings} />}
      {(report.statistical_findings || []).length > 0 && <ResultSection title="Statistical findings" items={report.statistical_findings} />}
      {((report.data_notes || []).length > 0 || (report.limitations || []).length > 0) && <div className="grid gap-3 lg:grid-cols-2"><SecondarySection title="Data notes" items={report.data_notes || []} /><SecondarySection title="Limitations" items={report.limitations || []} /></div>}
      {(report.recommendations || []).length > 0 && <Recommendations items={report.recommendations} />}
    </div>
  );
}

function TextBlock({ title, children }) {
  return <section><h2 className="mb-2 text-[13px] font-semibold text-[#1D1D1F]">{title}</h2>{children}</section>;
}

function ResultSection({ title, items }) {
  if (!items.length) return null;
  return <TextBlock title={title}><ul className="m-0 grid list-disc marker:text-blue-500 gap-1.5 pl-4 text-[12px] leading-5 text-[#515154]">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></TextBlock>;
}

function SecondarySection({ title, items }) {
  if (!items.length) return null;
  return <section className="rounded-xl border border-[#E5E5EA] bg-[#FAFAFB] px-4 py-3.5"><h2 className="m-0 text-[12px] font-semibold text-[#515154]">{title}</h2><ul className="mb-0 mt-2 grid list-disc marker:text-blue-400 gap-1 pl-4 text-[11px] leading-5 text-[#6E6E73]">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></section>;
}

function Recommendations({ items }) {
  return <section className="rounded-xl border border-[#DDE9E0] bg-[#F8FBF8] px-4 py-3.5"><h2 className="m-0 text-[12px] font-semibold text-[#28723F]">Recommendations</h2><ul className="mb-0 mt-2 grid list-disc marker:text-blue-400 gap-1 pl-4 text-[11px] leading-5 text-[#41644B]">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></section>;
}
