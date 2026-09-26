import { AnalysisResult } from './AnalysisResult';

export function AnalysisCanvas({ question, result, savedAnswer, progress, loading, onRetry, onCancel, onEdit }) {
  if (loading) return <CanvasSkeleton />;
  if (!question) return <EmptyAnalysis onSelect={onEdit} />;

  const run = question.run;
  const running = run.status === 'pending' || run.status === 'running' || Boolean(progress);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-5 pt-4 sm:px-6 sm:py-6">
      <section className="rounded-xl border border-[#E4E2F4] bg-[#F7F6FF] px-4 py-3" aria-label="Active question">
        <p className="m-0 whitespace-pre-wrap text-[13px] font-medium leading-5 text-[#30303A]">{question.query}</p>
      </section>
      {running ? <RunningState progress={progress} onCancel={() => onCancel(run.id)} /> : result?.report || result?.charts?.length ? <AnalysisResult report={result?.report} charts={result?.charts || []} /> : savedAnswer ? <p className="whitespace-pre-wrap text-sm leading-6 text-[#515154]">{savedAnswer}</p> : ['failed', 'cancelled'].includes(run.status) ? <FailedState message={run.error_message} cancelled={run.status === 'cancelled'} onRetry={() => onRetry(run.id)} onEdit={() => onEdit(question.query)} /> : <ResultUnavailable />}
    </div>
  );
}

function RunningState({ progress, onCancel }) {
  return (
    <section className="flex min-h-72 items-center justify-center" role="status" aria-live="polite">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E1E1E5] bg-white shadow-[0_10px_35px_rgba(30,30,50,0.055)]">
        <div className="flex items-start gap-3.5 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><span className="analysis-processing-dots analysis-processing-dots-dark" aria-hidden="true"><span /><span /><span /></span></span>
          <div className="min-w-0 pt-0.5"><h2 className="m-0 text-sm font-semibold text-[#1D1D1F]">{progress?.label || 'Analyzing your data…'}</h2><p className="mb-0 mt-1 text-xs leading-5 text-[#6E6E73]">{progress?.detail || 'Preparing analysis and calculating verified evidence.'}</p></div>
        </div>
        <div className="mx-5 h-1 overflow-hidden rounded-full bg-[#ECECEF] sm:mx-6"><div className="analysis-progress-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-indigo-400 via-indigo-600 to-indigo-400" /></div>
        <div className="mt-4 flex items-center justify-between border-t border-[#F0F0F2] px-5 py-3 sm:px-6"><span className="text-[10px] text-[#86868B]">You can leave this page while Tatparya works.</span><button className="border-0 bg-transparent p-0 text-xs font-medium text-[#6E6E73] hover:text-red-600" type="button" onClick={onCancel}>Cancel</button></div>
      </div>
    </section>
  );
}

function FailedState({ message, cancelled, onRetry, onEdit }) {
  return (
    <section className="flex min-h-72 items-center justify-center">
      <div className="max-w-md text-center"><div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-full bg-red-50 text-sm font-semibold text-red-600">!</div><h2 className="m-0 text-base font-semibold text-[#1D1D1F]">{cancelled ? 'Analysis cancelled.' : 'Analysis couldn’t be completed.'}</h2><p className="mb-4 mt-2 text-sm leading-6 text-[#6E6E73]">{message || 'Your question was saved and can be tried again.'}</p><div className="flex flex-wrap justify-center gap-2"><button className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white hover:bg-brand-700" type="button" onClick={onRetry}>Retry analysis</button><button className="rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-medium text-[#3A3A3C] hover:bg-[#F5F5F7]" type="button" onClick={onEdit}>Edit question</button></div></div>
    </section>
  );
}

function EmptyAnalysis({ onSelect }) {
  const examples = ['Show the most important trends in this dataset.', 'Compare performance across the main categories.', 'Create useful visuals and recommend next actions.'];
  return <div className="grid min-h-full place-content-center px-5 py-8 text-center"><h2 className="m-0 text-lg font-semibold text-[#1D1D1F]">Ask your first question about this dataset.</h2><p className="mb-0 mt-2 text-sm text-[#6E6E73]">Choose an example or write your own question below.</p><div className="mx-auto mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-3">{examples.map((example) => <button className="rounded-xl border border-[#E1E1E5] bg-white px-3 py-3 text-left text-xs leading-5 text-[#515154] transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700" type="button" key={example} onClick={() => onSelect(example)}>{example}</button>)}</div></div>;
}

function ResultUnavailable() {
  return <div className="grid min-h-64 place-content-center text-center"><h2 className="m-0 text-sm font-semibold text-[#1D1D1F]">Analysis result unavailable</h2><p className="mb-0 mt-2 text-xs text-[#6E6E73]">The saved result could not be loaded. Try reopening this analysis.</p></div>;
}

function CanvasSkeleton() {
  return <div className="mx-auto grid w-full max-w-6xl animate-pulse gap-4 px-6 py-6"><div className="h-14 rounded-xl bg-[#ECECEF]" /><div className="grid gap-3 sm:grid-cols-3"><div className="h-24 rounded-xl bg-white" /><div className="h-24 rounded-xl bg-white" /><div className="h-24 rounded-xl bg-white" /></div><div className="h-72 rounded-xl bg-white" /></div>;
}
