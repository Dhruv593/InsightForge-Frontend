import { useEffect, useRef } from 'react';
import { AnalysisResult } from '../results/AnalysisResult';

export function MessageList({ messages, runs, resultsByRun, loading, analysisProgress }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, runs, analysisProgress]);

  if (loading) return <MessageSkeleton />;
  if (!messages.length) return <EmptyConversation />;

  const runsById = Object.fromEntries(runs.map((run) => [run.id, run]));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 py-2 sm:py-4">
      {messages.map((message) => {
        const run = message.analysis_run_id ? runsById[message.analysis_run_id] : null;
        const assistant = message.role === 'assistant';
        const system = message.role === 'system';
        const result = run ? resultsByRun?.[run.id] : null;

        if (system) {
          return <div className="mx-auto px-4 py-2 text-center text-xs text-[#86868B]" key={message.id}>{message.content}</div>;
        }

        return (
          <article className={`flex items-start gap-3 ${assistant ? 'justify-start' : 'justify-end'}`} key={message.id}>
            {assistant && <Avatar assistant />}
            <div className={`flex flex-col ${assistant ? 'w-[calc(100%-2.5rem)] max-w-4xl items-start' : 'max-w-[82%] items-end sm:max-w-[70%]'}`}>
              <div className="mb-1.5 flex items-center gap-2 px-1 text-[11px] text-slate-400">
                <span className="font-medium text-[#515154]">{assistant ? 'InsightForge' : 'You'}</span>
                <time dateTime={message.created_at}>{formatTime(message.created_at)}</time>
              </div>
              <div className={assistant
                ? 'w-full rounded-xl border border-[#E5E5E8] bg-white px-4 py-3.5 text-[#2C2C2E] shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:px-5 sm:py-4'
                : 'rounded-xl bg-[#4338CA] px-4 py-3 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)]'}>
                <MessageContent content={assistant && result?.report ? result.report.executive_summary : message.content} assistant={assistant} />
              </div>
              <RunBadge run={run} />
              {assistant && run && <AnalysisResult report={result?.report} charts={result?.charts} />}
            </div>
            {!assistant && <Avatar />}
          </article>
        );
      })}

      {analysisProgress && (
        <div className="flex items-end gap-2.5">
          <Avatar assistant />
          <div className="min-w-72 rounded-xl border border-[#E5E5E8] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]" role="status" aria-live="polite">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-50" /><span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" /></span>
              <div><p className="m-0 text-xs font-semibold text-slate-800">{analysisProgress.label}</p><p className="mt-0.5 text-[10px] leading-4 text-slate-500">{analysisProgress.detail}</p></div>
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageContent({ content, assistant }) {
  if (!assistant) return <p className="m-0 whitespace-pre-wrap text-sm leading-6">{content}</p>;

  return (
    <div className="grid gap-2 text-sm leading-6">
      {content.split('\n').map((line, index) => {
        const numbered = line.match(/^(\d+)\.\s+(.+)$/);
        if (!line.trim()) return <div className="h-1" key={index} />;
        if (numbered) {
          return <div className="flex gap-3" key={index}><span className="mt-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600">{numbered[1]}</span><span>{numbered[2]}</span></div>;
        }
        if (line.startsWith('- ')) return <div className="flex gap-2" key={index}><span className="text-indigo-500">•</span><span>{line.slice(2)}</span></div>;
        if (line.endsWith(':')) return <p className="m-0 pt-1 font-semibold text-slate-950" key={index}>{line}</p>;
        return <p className="m-0" key={index}>{line}</p>;
      })}
    </div>
  );
}

function RunBadge({ run }) {
  if (!run || run.status === 'completed') return null;
  const labels = {
    pending: 'Queued',
    running: 'Analyzing',
    failed: 'Analysis failed',
    cancelled: 'Cancelled',
  };
  const failed = run.status === 'failed';
  return (
    <div className={`mt-2 inline-flex items-center gap-1.5 px-1 text-[11px] font-medium ${failed ? 'text-red-600' : 'text-[#6E6E73]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${failed ? 'bg-red-500' : 'bg-indigo-500'}`} />
      <span>{labels[run.status] ?? run.status}</span>
    </div>
  );
}

function Avatar({ assistant = false }) {
  return assistant
    ? <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#1D1D1F] text-[9px] font-semibold text-white shadow-sm">IF</div>
    : <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E5E5EA] text-[9px] font-semibold text-[#6E6E73]">You</div>;
}

function MessageSkeleton() {
  return <div className="mx-auto grid max-w-3xl gap-7 py-6"><div className="flex justify-end"><div className="h-16 w-64 animate-pulse rounded-2xl bg-slate-200" /></div><div className="flex gap-3"><div className="h-8 w-8 animate-pulse rounded-xl bg-slate-200" /><div className="h-28 w-full max-w-lg animate-pulse rounded-2xl bg-slate-100" /></div></div>;
}

function EmptyConversation() {
  return <div className="grid min-h-full place-content-center px-4 text-center"><h2 className="mb-2 text-lg font-semibold text-[#1D1D1F]">Ask about this dataset</h2><p className="m-0 max-w-md text-sm leading-6 text-[#6E6E73]">Results are calculated from the uploaded data and saved to this analysis.</p></div>;
}

const formatTime = (value) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
