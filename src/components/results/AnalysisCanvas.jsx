import { AnalysisResult } from './AnalysisResult';

export function AnalysisCanvas({ question, result, savedAnswer, progress, loading }) {
  if (loading) return <CanvasSkeleton />;
  if (!question) return <EmptyAnalysis />;

  const run = question.run;
  const running = run.status === 'pending' || run.status === 'running' || Boolean(progress);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 sm:px-6 sm:py-6">
      <section className="rounded-xl border border-[#E4E2F4] bg-[#F7F6FF] px-4 py-3" aria-label="Active question">
        <p className="m-0 whitespace-pre-wrap text-[13px] font-medium leading-5 text-[#30303A]">{question.query}</p>
      </section>
      {running ? <RunningState progress={progress} /> : result?.report ? <AnalysisResult report={result.report} charts={result.charts || []} /> : savedAnswer ? <p className="whitespace-pre-wrap text-sm leading-6 text-[#515154]">{savedAnswer}</p> : run.status === 'failed' ? <FailedState message={run.error_message} /> : <ResultUnavailable />}
    </div>
  );
}

function RunningState({ progress }) {
  return (
    <section className="flex min-h-72 items-center justify-center" role="status" aria-live="polite">
      <div className="w-full max-w-md rounded-xl border border-[#E5E5EA] bg-white px-5 py-5 shadow-[0_2px_10px_rgba(0,0,0,0.025)]">
        <div className="mb-4 flex items-center gap-3"><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-40" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600" /></span><div><h2 className="m-0 text-sm font-semibold text-[#1D1D1F]">{progress?.label || 'Analyzing your data…'}</h2><p className="mb-0 mt-1 text-xs leading-5 text-[#6E6E73]">{progress?.detail || 'Preparing analysis and calculating verified evidence.'}</p></div></div>
        <div className="h-1 overflow-hidden rounded-full bg-[#ECECEF]"><div className="h-full w-2/5 animate-pulse rounded-full bg-indigo-600" /></div>
      </div>
    </section>
  );
}

function FailedState({ message }) {
  return (
    <section className="flex min-h-72 items-center justify-center">
      <div className="max-w-md text-center"><div className="mx-auto mb-3 grid h-9 w-9 place-items-center rounded-full bg-red-50 text-sm font-semibold text-red-600">!</div><h2 className="m-0 text-base font-semibold text-[#1D1D1F]">Analysis couldn’t be completed.</h2><p className="mb-4 mt-2 text-sm leading-6 text-[#6E6E73]">{message || 'Please adjust the question and try again.'}</p><button className="rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-medium text-[#3A3A3C] hover:bg-[#F5F5F7]" type="button" onClick={() => document.getElementById('analysis-query')?.focus()}>Ask another question</button></div>
    </section>
  );
}

function EmptyAnalysis() {
  return <div className="grid min-h-full place-content-center px-6 text-center"><h2 className="m-0 text-lg font-semibold text-[#1D1D1F]">Ask your first question about this dataset.</h2><p className="mb-0 mt-2 text-sm text-[#6E6E73]">Your analysis results will appear here.</p></div>;
}

function ResultUnavailable() {
  return <div className="grid min-h-64 place-content-center text-center"><h2 className="m-0 text-sm font-semibold text-[#1D1D1F]">Analysis result unavailable</h2><p className="mb-0 mt-2 text-xs text-[#6E6E73]">The saved result could not be loaded. Try reopening this analysis.</p></div>;
}

function CanvasSkeleton() {
  return <div className="mx-auto grid w-full max-w-6xl animate-pulse gap-4 px-6 py-6"><div className="h-14 rounded-xl bg-[#ECECEF]" /><div className="grid gap-3 sm:grid-cols-3"><div className="h-24 rounded-xl bg-white" /><div className="h-24 rounded-xl bg-white" /><div className="h-24 rounded-xl bg-white" /></div><div className="h-72 rounded-xl bg-white" /></div>;
}
