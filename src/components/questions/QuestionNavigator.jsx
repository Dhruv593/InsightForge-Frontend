import { DockPanel } from '../layout/DockPanel';
import { usePersistentState } from '../../hooks/usePersistentState';

export function QuestionNavigator({ questions, selectedRunId, open, onClose, onSelect }) {
  const [pinned, setPinned] = usePersistentState('insightforge.questions.open', false);
  const content = <NavigatorContent questions={questions} selectedRunId={selectedRunId} onSelect={onSelect} />;
  return (
    <>
      <DockPanel compact side="right" title="Questions" pinned={pinned} onPin={setPinned}>{content}</DockPanel>
      {open && <div className="fixed inset-0 z-40 lg:hidden"><button className="absolute inset-0 border-0 bg-black/20" type="button" aria-label="Close questions" onClick={onClose} /><aside className="absolute bottom-0 right-0 top-0 flex w-[min(17rem,86vw)] flex-col border-l border-[#E5E5EA] bg-[#FAFAFB] shadow-[-8px_0_30px_rgba(0,0,0,0.08)]"><header className="flex h-12 shrink-0 items-center border-b border-[#E5E5EA] px-3 text-xs font-semibold text-[#515154]">Questions</header><button className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-lg border-0 bg-transparent text-lg text-[#6E6E73] hover:bg-[#ECECEF]" type="button" onClick={onClose} aria-label="Close questions">×</button>{content}</aside></div>}
    </>
  );
}

function NavigatorContent({ questions, selectedRunId, onSelect }) {
  return (
    <>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Questions in this analysis">
        {!questions.length ? <div className="px-2 py-5"><p className="m-0 text-xs font-medium text-[#515154]">No questions yet.</p><p className="mb-0 mt-1 text-[11px] leading-5 text-[#86868B]">Ask your first question below.</p></div> : <ol className="m-0 grid list-none gap-1 p-0">{questions.map((question) => <li key={question.run.id}><button className={`flex min-h-11 w-full items-start gap-2 rounded-lg border px-2 py-2 text-left transition ${question.run.id === selectedRunId ? 'border-[#DDD9FA] bg-[#F2F0FF]' : 'border-transparent bg-transparent hover:bg-[#F2F2F4]'}`} type="button" title={question.query} onClick={() => onSelect(question.run.id)}><span className="inline-flex min-w-5 shrink-0 items-center gap-1 pt-0.5 text-[9px] font-semibold tabular-nums text-[#8B84D7]">{question.sequence}{['pending', 'running'].includes(question.run.status) && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />}</span><span className="block min-w-0 overflow-hidden text-[11px] font-medium leading-4 text-[#3A3A3C]" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{question.query}</span></button></li>)}</ol>}
      </nav>
    </>
  );
}
