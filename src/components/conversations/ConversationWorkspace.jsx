import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QueryBox } from '../query/QueryBox';
import { QuestionNavigator } from '../questions/QuestionNavigator';
import { AnalysisCanvas } from '../results/AnalysisCanvas';
import { AnalysisHeader } from '../results/AnalysisHeader';

export function ConversationWorkspace({ conversation, dataset, messages, runs, resultsByRun, loading, querySubmitting, analysisProgress, queryError, profileComplete, onQuery, onProfile, onRename, onDelete, onRetry, onCancel }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [questionsOpen, setQuestionsOpen] = useState(false);
  const [queryDraft, setQueryDraft] = useState(null);
  const resultScrollRef = useRef(null);
  const newestRunRef = useRef(null);

  const questions = useMemo(() => {
    const messagesByRun = Object.fromEntries(messages.filter((message) => message.role === 'user' && message.analysis_run_id).map((message) => [message.analysis_run_id, message]));
    return runs.map((run, index) => {
      const message = messagesByRun[run.id];
      return {
        run,
        query: run.query || message?.content || 'Untitled question',
        createdAt: message?.created_at || run.created_at,
        sequence: String(runs.length - index).padStart(2, '0'),
      };
    });
  }, [messages, runs]);

  useEffect(() => {
    const requestedRunId = searchParams.get('run');
    const validRequested = runs.some((run) => run.id === requestedRunId);
    const nextId = validRequested ? requestedRunId : runs[0]?.id || null;
    setSelectedRunId(nextId);
    newestRunRef.current = runs[0]?.id || null;
  }, [conversation.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const newestId = runs[0]?.id || null;
    const selectedStillExists = runs.some((run) => run.id === selectedRunId);
    const newQuestionWasAdded = Boolean(newestId && newestRunRef.current && newestRunRef.current !== newestId);
    const requestedRunId = searchParams.get('run');
    const validRequested = runs.some((run) => run.id === requestedRunId);
    if (!selectedStillExists || newQuestionWasAdded) selectQuestion(newQuestionWasAdded ? newestId : validRequested ? requestedRunId : newestId);
    newestRunRef.current = newestId;
  }, [runs, selectedRunId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedQuestion = questions.find((question) => question.run.id === selectedRunId) || null;
  const selectedResult = selectedRunId ? resultsByRun?.[selectedRunId] : null;
  const savedAnswer = messages.find((message) => message.role === 'assistant' && message.analysis_run_id === selectedRunId)?.content;
  const selectedIsActiveSubmission = ['pending', 'running'].includes(selectedQuestion?.run.status);

  function selectQuestion(runId) {
    setSelectedRunId(runId || null);
    const nextParams = new window.URLSearchParams(searchParams);
    if (runId) nextParams.set('run', runId);
    else nextParams.delete('run');
    setSearchParams(nextParams, { replace: true });
    setQuestionsOpen(false);
    window.requestAnimationFrame(() => resultScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  return (
    <section className="flex h-full min-h-0 overflow-hidden bg-[#F5F5F7]">
      <div className="grid min-w-0 flex-1 grid-rows-[auto_1fr_auto] overflow-hidden">
        <AnalysisHeader conversation={conversation} dataset={dataset} profileComplete={profileComplete} result={selectedResult} onRename={onRename} onDelete={onDelete} onOpenQuestions={() => setQuestionsOpen(true)} />
        <div className="min-h-0 overflow-y-auto" ref={resultScrollRef}>
          <AnalysisCanvas question={selectedQuestion} result={selectedResult} savedAnswer={savedAnswer} progress={selectedIsActiveSubmission ? analysisProgress : null} loading={loading} onRetry={onRetry} onCancel={onCancel} onEdit={(query) => setQueryDraft({ query, id: Date.now() })} />
        </div>
        <QueryBox disabled={loading} submitting={querySubmitting} error={queryError} profileRequired={!profileComplete} onProfile={onProfile} onSubmit={onQuery} draft={queryDraft} />
      </div>
      <QuestionNavigator questions={questions} selectedRunId={selectedRunId} open={questionsOpen} onClose={() => setQuestionsOpen(false)} onSelect={selectQuestion} />
    </section>
  );
}
