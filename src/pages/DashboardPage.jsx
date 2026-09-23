import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConversationWorkspace } from '../components/conversations/ConversationWorkspace';
import { DatasetProfile } from '../components/datasets/DatasetProfile';
import { DatasetPreviewDialog } from '../components/datasets/DatasetPreviewDialog';
import { AppHeader } from '../components/layout/AppHeader';
import { datasetMeta, Sidebar } from '../components/layout/Sidebar';
import { analysisService } from '../services/analysisService';
import { getApiError } from '../services/api';
import { conversationService } from '../services/conversationService';
import { datasetService } from '../services/datasetService';
import { profileService } from '../services/profileService';
import { usePersistentState } from '../hooks/usePersistentState';
import { useAuth } from '../context/AuthContext';
import { accountService } from '../services/accountService';
import { OnboardingTour, onboardingStepFor } from '../components/onboarding/OnboardingTour';

export function DashboardPage() {
  const { datasetId: routeDatasetId, conversationId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const emptyUploadRef = useRef(null);
  const [datasets, setDatasets] = useState([]);
  const [datasetsLoading, setDatasetsLoading] = useState(true);
  const [datasetProfiles, setDatasetProfiles] = useState({});
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [runs, setRuns] = useState([]);
  const [resultsByRun, setResultsByRun] = useState({});
  const [conversationLoading, setConversationLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profiling, setProfiling] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [querySubmitting, setQuerySubmitting] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [activeQueue, setActiveQueue] = useState([]);
  const { error: setPageError, success } = useToast();
  const setQueryError = setPageError;
  const setProfileError = setPageError;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = usePersistentState('insightforge.sidebar.open', false);
  const [modal, setModal] = useState(null);
  const [modalInput, setModalInput] = useState('');
  const [modalDatasetId, setModalDatasetId] = useState('');
  const [modalBusy, setModalBusy] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(false);
  const [previewDataset, setPreviewDataset] = useState(null);

  const selectedDatasetId = routeDatasetId ?? activeConversation?.dataset_id ?? null;
  const selectedDataset = datasets.find((item) => item.id === selectedDatasetId) ?? null;
  const profileComplete = profile?.profile_status === 'completed';
  const onboardingActive = Boolean(user && !user.onboarding_completed_at && !tourDismissed);
  const onboardingStep = onboardingStepFor({ datasets, datasetProfiles });

  const finishOnboarding = useCallback(async () => {
    setTourDismissed(true);
    try {
      await accountService.completeOnboarding();
      await refreshUser();
    } catch (error) {
      setTourDismissed(false);
      setPageError(getApiError(error, 'The product tour could not be dismissed.').message);
    }
  }, [refreshUser, setPageError]);

  const loadDatasetProfiles = useCallback(async (items) => {
    const entries = await Promise.all(items.map(async (dataset) => {
      try {
        return [dataset.id, await profileService.get(dataset.id)];
      } catch {
        return [dataset.id, null];
      }
    }));
    setDatasetProfiles(Object.fromEntries(entries));
  }, []);

  const loadDatasets = useCallback(async () => {
    setDatasetsLoading(true);
    try {
      const response = await datasetService.list();
      const items = response.items ?? [];
      setDatasets(items);
      await loadDatasetProfiles(items);
      return items;
    } catch (error) {
      setPageError(getApiError(error, 'Could not load datasets.').message);
    } finally {
      setDatasetsLoading(false);
    }
  }, [loadDatasetProfiles, setPageError]);

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const response = await conversationService.list();
      setConversations(response.items ?? []);
      return response.items ?? [];
    } catch (error) {
      setPageError(getApiError(error, 'Could not load analyses.').message);
      return [];
    } finally {
      setConversationsLoading(false);
    }
  }, [setPageError]);

  useEffect(() => { loadDatasets(); loadConversations(); }, [loadDatasets, loadConversations]);

  useEffect(() => {
    if (!onboardingActive || datasetsLoading || conversationsLoading || !datasets.length) return;
    if (!selectedDatasetId) {
      navigate(`/dashboard/datasets/${datasets[0].id}`, { replace: true });
      return;
    }
  }, [conversationsLoading, datasets, datasetsLoading, navigate, onboardingActive, selectedDatasetId]);

  useEffect(() => {
    let current = true;
    let timer;
    const loadQueue = async () => {
      try {
        const response = await analysisService.activeQueue();
        if (current) setActiveQueue(response.items ?? []);
      } catch {
        // The conversation-specific polling remains available if this summary request fails.
      }
      if (current) timer = window.setTimeout(loadQueue, 2200);
    };
    loadQueue();
    return () => { current = false; window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    let current = true;
    if (!conversationId) {
      setActiveConversation(null);
      setMessages([]);
      setRuns([]);
      setResultsByRun({});
      return undefined;
    }
    setConversationLoading(true);
    conversationService.get(conversationId)
      .then((result) => current && setActiveConversation(result))
      .catch((error) => {
        if (current) {
          setPageError(getApiError(error).message);
          navigate('/dashboard', { replace: true });
        }
      });
    return () => { current = false; };
  }, [conversationId, navigate, setPageError]);

  useEffect(() => {
    let current = true;
    if (!selectedDatasetId) {
      setProfile(null);
      return undefined;
    }
    setProfileLoading(true);
    setProfileError('');
    profileService.get(selectedDatasetId)
      .then((result) => {
        if (!current) return;
        setProfile(result);
        setDatasetProfiles((profiles) => ({ ...profiles, [selectedDatasetId]: result }));
      })
      .catch((error) => {
        if (!current) return;
        const parsed = getApiError(error);
        if (parsed.code === 'DATASET_PROFILE_NOT_FOUND') setProfile(null);
        else setProfileError(parsed.message);
      })
      .finally(() => current && setProfileLoading(false));
    return () => { current = false; };
  }, [selectedDatasetId, setProfileError]);

  useEffect(() => {
    let current = true;
    if (!conversationId) return undefined;
    setConversationLoading(true);
    Promise.all([
      conversationService.messages(conversationId),
      analysisService.listForConversation(conversationId),
    ])
      .then(([messageResponse, runResponse]) => {
        if (!current) return;
        const loadedRuns = runResponse.items ?? [];
        setMessages(messageResponse.items ?? []);
        setRuns(loadedRuns);
        loadResults(loadedRuns).then((results) => current && setResultsByRun(results));
      })
      .catch((error) => current && setPageError(getApiError(error, 'Could not load this analysis.').message))
      .finally(() => current && setConversationLoading(false));
    return () => { current = false; };
  }, [conversationId, setPageError]);

  const activeRunSignature = runs.filter((run) => ['pending', 'running'].includes(run.status)).map((run) => `${run.id}:${run.status}`).join('|');
  useEffect(() => {
    if (!conversationId || !activeRunSignature) {
      setAnalysisProgress(null);
      return undefined;
    }
    let current = true;
    let timer;
    const previouslyActiveIds = new Set(activeRunSignature.split('|').map((item) => item.split(':')[0]));
    const refreshActiveRuns = async () => {
      try {
        const runResponse = await analysisService.listForConversation(conversationId);
        if (!current) return;
        const loadedRuns = runResponse.items ?? [];
        const active = loadedRuns.find((run) => ['pending', 'running'].includes(run.status));
        const completedSinceLastPoll = loadedRuns.some((next) => previouslyActiveIds.has(next.id) && !['pending', 'running'].includes(next.status));
        if (!active || completedSinceLastPoll) {
          const [messageResponse, results] = await Promise.all([
            conversationService.messages(conversationId),
            loadResults(loadedRuns),
          ]);
          if (!current) return;
          setMessages(messageResponse.items ?? []);
          setResultsByRun(results);
        }
        setRuns(loadedRuns);
        if (active?.status === 'pending') {
          const queued = await analysisService.queueStatus(active.id);
          if (current) setAnalysisProgress({ label: 'Waiting to begin…', detail: queued.queue_position ? `Your analysis is number ${queued.queue_position} in the queue.` : 'Your analysis is safely queued.' });
        } else if (active) {
          const agents = await analysisService.listAgentRuns(active.id);
          if (current) setAnalysisProgress(progressFromAgentRuns(agents.items ?? []));
        } else if (!active) setAnalysisProgress(null);
      } catch {
        // A transient poll failure must not discard a queued server-side analysis.
      }
      if (current) timer = window.setTimeout(refreshActiveRuns, 1400);
    };
    timer = window.setTimeout(refreshActiveRuns, 350);
    return () => { current = false; window.clearTimeout(timer); };
  }, [conversationId, activeRunSignature]);

  async function uploadDataset(file, keepAnalysisModal = false) {
    setUploading(true);
    setPageError('');
    try {
      const dataset = await datasetService.upload(file);
      success('Dataset uploaded successfully.');
      await loadDatasets();
      if (keepAnalysisModal) setModalDatasetId(dataset.id);
      navigate(`/dashboard/datasets/${dataset.id}`);
      setSidebarOpen(false);
    } catch (error) {
      setPageError(getApiError(error, 'Dataset upload failed.').message);
    } finally {
      setUploading(false);
    }
  }

  async function profileDataset() {
    if (!selectedDatasetId) return;
    setProfiling(true);
    setProfileError('');
    try {
      const result = await profileService.create(selectedDatasetId);
      success('Dataset profile is ready.');
      setProfile(result);
      setDatasetProfiles((current) => ({ ...current, [selectedDatasetId]: result }));
    } catch (error) {
      setProfileError(getApiError(error, 'Dataset profiling failed.').message);
      try {
        setProfile(await profileService.get(selectedDatasetId));
      } catch {
        setProfile(null);
      }
    } finally {
      setProfiling(false);
    }
  }

  async function submitQuery(payload, force = false) {
    if ((user?.credits ?? 0) < 1) {
      setQueryError('You have no question credits left. Get more credits to continue.');
      return false;
    }
    setQuerySubmitting(true);
    setQueryError('');
    try {
      const result = await analysisService.createQuery(conversationId, { ...payload, force });
      setMessages((current) => [...current, result.message]);
      setRuns((current) => [result.analysis_run, ...current]);
      setActiveQueue((current) => current.some((run) => run.id === result.analysis_run.id) ? current : [...current, result.analysis_run]);
      setAnalysisProgress({ label: 'Waiting to begin…', detail: 'Your question is safely queued.' });
      refreshUser().catch(() => undefined);
      success('Analysis added to the queue.');
      return true;
    } catch (error) {
      const parsed = getApiError(error, 'Could not submit the query.');
      if (parsed.code === 'DUPLICATE_ANALYSIS_RUN' && parsed.details?.analysis_run_id) {
        setModal({ type: 'duplicate-query', title: 'Similar analysis found', runId: parsed.details.analysis_run_id, payload });
      } else {
        setQueryError(parsed.message);
        if (parsed.code === 'INSUFFICIENT_CREDITS') refreshUser().catch(() => undefined);
      }
      return false;
    } finally {
      setQuerySubmitting(false);
    }
  }

  async function retryAnalysis(runId) {
    setQuerySubmitting(true);
    try {
      const result = await analysisService.retry(runId);
      setMessages((current) => [...current, result.message]);
      setRuns((current) => [result.analysis_run, ...current]);
      setActiveQueue((current) => [...current, result.analysis_run]);
      success('Analysis added to the queue again.');
    } catch (error) {
      setQueryError(getApiError(error, 'Could not retry this analysis.').message);
    } finally {
      setQuerySubmitting(false);
    }
  }

  async function cancelAnalysis(runId) {
    try {
      const cancelled = await analysisService.cancel(runId);
      setRuns((current) => current.map((run) => run.id === cancelled.id ? cancelled : run));
      setActiveQueue((current) => current.filter((run) => run.id !== cancelled.id));
      success('Analysis cancelled.');
    } catch (error) {
      setQueryError(getApiError(error, 'Could not cancel this analysis.').message);
    }
  }

  function openCreateConversation() {
    setModalInput('');
    setModalDatasetId(selectedDatasetId || datasets[0]?.id || '');
    setModal({ type: 'create', title: 'Start a new analysis' });
  }

  function openRenameConversation() {
    setModalInput(activeConversation?.title ?? '');
    setModal({ type: 'rename', title: 'Rename analysis' });
  }

  async function confirmModal() {
    setModalBusy(true);
    setPageError('');
    try {
      if (modal.type === 'create') {
        if (!modalDatasetId) return;
        const created = await conversationService.create({ dataset_id: modalDatasetId, title: modalInput.trim() || 'New Analysis' });
        success('Analysis created successfully.');
        setConversations((current) => [created, ...current]);
        navigate(`/dashboard/conversations/${created.id}`);
        if (onboardingActive) await finishOnboarding();
      } else if (modal.type === 'rename') {
        const updated = await conversationService.rename(activeConversation.id, modalInput.trim());
        success('Analysis renamed successfully.');
        setActiveConversation(updated);
        setConversations((current) => current.map((item) => item.id === updated.id ? updated : item));
      } else if (modal.type === 'delete-conversation') {
        await conversationService.remove(activeConversation.id);
        success('Analysis deleted.');
        navigate(`/dashboard/datasets/${selectedDatasetId}`);
        setConversations((current) => current.filter((item) => item.id !== activeConversation.id));
      } else if (modal.type === 'delete-dataset') {
        await datasetService.remove(modal.dataset.id);
        success('Dataset deleted.');
        setDatasets((current) => current.filter((item) => item.id !== modal.dataset.id));
        setDatasetProfiles((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== modal.dataset.id)));
        setConversations((current) => current.filter((item) => item.dataset_id !== modal.dataset.id));
        navigate('/dashboard');
      } else if (modal.type === 'duplicate-query') {
        const created = await submitQuery(modal.payload, true);
        if (!created) return;
      }
      setModal(null);
    } catch (error) {
      setPageError(getApiError(error).message);
      setModal(null);
    } finally {
      setModalBusy(false);
    }
  }

  return (
    <div className="dashboard-shell min-h-[100dvh] bg-[#F5F5F7]" data-onboarding-step={onboardingActive && !modal ? onboardingStep : undefined}>
      <AppHeader onToggleSidebar={() => setSidebarOpen((value) => !value)} activeRuns={activeQueue} onSelectRun={(run) => navigate(`/dashboard/conversations/${run.conversation_id}?run=${run.id}`)} onCancelRun={(run) => cancelAnalysis(run.id)} />
      <div className="flex h-[100dvh] overflow-hidden pt-14">
        <Sidebar
          open={sidebarOpen}
          pinned={sidebarPinned}
          onPin={setSidebarPinned}
          datasets={datasets}
          datasetProfiles={datasetProfiles}
          datasetsLoading={datasetsLoading}
          selectedDatasetId={selectedDatasetId}
          conversations={conversations}
          conversationsLoading={conversationsLoading}
          selectedConversationId={conversationId}
          uploading={uploading}
          onUpload={uploadDataset}
          onViewDatasets={() => { navigate('/dashboard'); setSidebarOpen(false); }}
          onSelectConversation={(id) => { navigate(`/dashboard/conversations/${id}`); setSidebarOpen(false); }}
          onNewAnalysis={openCreateConversation}
        />
        {sidebarOpen && <button className="fixed inset-x-0 bottom-0 top-14 z-10 border-0 bg-black/25 lg:hidden" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />}
        <main className={`h-full min-h-0 min-w-0 flex-1 ${conversationId && activeConversation ? 'overflow-hidden p-0' : 'overflow-x-hidden overflow-y-auto overscroll-contain p-4 pb-10 lg:p-8 lg:pb-12'}`}>
          {!selectedDatasetId ? (
            datasets.length ? <DatasetLibrary datasets={datasets} profiles={datasetProfiles} uploading={uploading} onUpload={() => emptyUploadRef.current?.click()} onOpen={(id) => navigate(`/dashboard/datasets/${id}`)} onPreview={setPreviewDataset} onDelete={(dataset) => setModal({ type: 'delete-dataset', title: `Delete ${dataset.original_file_name}?`, dataset })} /> :
            <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl flex-col items-start justify-center"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-600">Your workspace</p><h1 className="mb-3 text-4xl font-semibold tracking-[-0.04em] text-[#1D1D1F]">Start with a dataset.</h1><p className="mb-7 max-w-lg text-[15px] leading-7 text-[#6E6E73]">Upload a CSV, Excel, JSON, or Parquet file, then create an analysis from the sidebar.</p><button data-tour="upload-dataset" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50" type="button" onClick={() => emptyUploadRef.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload Dataset'}</button></section>
          ) : conversationId && activeConversation ? (
            <ConversationWorkspace
              conversation={activeConversation}
              dataset={selectedDataset}
              messages={messages}
              runs={runs}
              resultsByRun={resultsByRun}
              loading={conversationLoading}
              querySubmitting={querySubmitting}
              analysisProgress={analysisProgress}
              profileComplete={profileComplete}
              credits={user?.credits ?? 0}
              onQuery={submitQuery}
              onProfile={profileDataset}
              onRename={openRenameConversation}
              onDelete={() => setModal({ type: 'delete-conversation', title: `Delete ${activeConversation.title}?` })}
              onRetry={retryAnalysis}
              onCancel={cancelAnalysis}
            />
          ) : (
            <section className="mx-auto max-w-5xl">
              <header className="flex flex-col items-start justify-between gap-5 px-0 py-5 sm:flex-row sm:items-end sm:py-7"><div className="min-w-0"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-brand-600">Selected dataset</p><h1 className="mb-2 break-words text-2xl font-semibold tracking-[-0.03em] text-[#1D1D1F] sm:text-3xl">{selectedDataset?.original_file_name ?? 'Loading dataset…'}</h1><p className="m-0 text-xs text-[#6E6E73]">{selectedDataset ? `${selectedDataset.file_type.toUpperCase()} · ${formatBytes(selectedDataset.file_size)}` : ''}</p></div><div className="flex flex-wrap gap-2"><button className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#D2D2D7] bg-white px-4 text-sm font-medium text-[#3A3A3C] transition hover:bg-[#F7F7F8] disabled:opacity-50" type="button" onClick={() => setPreviewDataset(selectedDataset)} disabled={!selectedDataset}>View data</button><button data-tour="new-analysis" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700" type="button" onClick={openCreateConversation}>New Analysis</button></div></header>
              <DatasetProfile profile={profile} loading={profileLoading} profiling={profiling} onProfile={profileDataset} />
            </section>
          )}
        </main>
      </div>
      <input ref={emptyUploadRef} className="sr-only" type="file" accept=".csv,.xlsx,.xls,.json,.parquet" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadDataset(file, modal?.type === 'create'); event.target.value = ''; }} />
      {modal && <Modal title={modal.title} description={modal.type === 'create' ? 'Choose a name and dataset to begin.' : undefined} danger={modal.type.startsWith('delete')} confirmLabel={modal.type.startsWith('delete') ? 'Delete' : modal.type === 'create' ? 'Start Analysis' : modal.type === 'duplicate-query' ? 'Run again' : 'Save'} confirmDisabled={modal.type === 'create' && (!datasets.length || !modalDatasetId || !modalInput.trim())} busy={modalBusy} onClose={() => setModal(null)} onConfirm={confirmModal}>
        {modal.type === 'create' ? <NewAnalysisFields datasets={datasets} profiles={datasetProfiles} title={modalInput} datasetId={modalDatasetId} uploading={uploading} onTitleChange={setModalInput} onDatasetChange={setModalDatasetId} onUpload={() => emptyUploadRef.current?.click()} /> : modal.type === 'rename' ? <label className="grid gap-2 text-sm font-medium text-[#3A3A3C]">Analysis name<input className="min-h-11 rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-[#1D1D1F] focus:border-brand-500" value={modalInput} onChange={(event) => setModalInput(event.target.value)} maxLength={200} autoFocus /></label> : modal.type === 'duplicate-query' ? <div><p className="mt-0">This question has already been analyzed for the selected dataset.</p><button className="border-0 bg-transparent p-0 text-sm font-medium text-brand-600 hover:text-brand-700" type="button" onClick={() => { navigate(`/dashboard/conversations/${conversationId}?run=${modal.runId}`); setModal(null); }}>Open existing result</button></div> : <p className="m-0">{modal.type === 'delete-dataset' ? 'This also removes its profile and analyses. This action cannot be undone.' : 'Its messages and analysis runs will be removed. The dataset will remain.'}</p>}
      </Modal>}
      {onboardingActive && !datasetsLoading && !conversationsLoading && <OnboardingTour step={onboardingStep} hidden={Boolean(modal)} onSkip={finishOnboarding} />}
      {previewDataset && <DatasetPreviewDialog dataset={previewDataset} onClose={() => setPreviewDataset(null)} />}
    </div>
  );
}

function DatasetLibrary({ datasets, profiles, uploading, onUpload, onOpen, onPreview, onDelete }) {
  return <section className="mx-auto max-w-5xl">
    <header className="flex flex-col items-start justify-between gap-4 py-5 sm:flex-row sm:items-end sm:py-7">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-600">Data</p><h1 className="m-0 text-3xl font-semibold tracking-[-0.035em] text-[#1D1D1F]">Your datasets</h1><p className="mb-0 mt-2 text-sm text-[#6E6E73]">Open a dataset to review its profile or start an analysis.</p></div>
      <button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50" type="button" onClick={onUpload} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload Dataset'}</button>
    </header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{datasets.map((dataset) => {
      const profile = profiles?.[dataset.id];
      const ready = profile?.profile_status === 'completed';
      return <article className="group min-w-0 rounded-xl border border-[#E1E1E5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.025)] transition hover:border-[#CBCBD1] hover:shadow-[0_5px_18px_rgba(0,0,0,0.055)]" key={dataset.id}>
        <button className="block w-full min-w-0 border-0 bg-transparent p-0 text-left" type="button" onClick={() => onOpen(dataset.id)}>
          <span className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><DatasetFileIcon /></span>
          <span className="block truncate text-sm font-semibold text-[#1D1D1F]" title={dataset.original_file_name}>{dataset.original_file_name}</span>
          <span className="mt-1 block truncate text-xs text-[#86868B]">{datasetMeta(dataset, profile)}</span>
        </button>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EFEFF1] pt-3"><span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${ready ? 'text-emerald-700' : 'text-amber-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${ready ? 'bg-emerald-500' : 'bg-amber-500'}`} />{ready ? 'Ready' : 'Not profiled'}</span><div className="flex items-center gap-3"><button className="border-0 bg-transparent p-0 text-xs font-medium text-[#515154] hover:text-[#1D1D1F]" type="button" onClick={() => onPreview(dataset)}>View data</button><button className="border-0 bg-transparent p-0 text-xs font-medium text-brand-600 hover:text-brand-700" type="button" onClick={() => onOpen(dataset.id)}>Open</button><button className="border-0 bg-transparent p-0 text-xs font-medium text-red-500 hover:text-red-700" type="button" onClick={() => onDelete(dataset)}>Delete</button></div></div>
      </article>;
    })}</div>
  </section>;
}

function DatasetFileIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5M10 13h5M10 17h5" /></svg>; }

function NewAnalysisFields({ datasets, profiles, title, datasetId, uploading, onTitleChange, onDatasetChange, onUpload }) {
  return (
    <div className="grid gap-5">
      <label className="grid gap-2 text-sm font-medium text-[#3A3A3C]">Analysis name<input className="min-h-11 rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-[#1D1D1F] transition focus:border-brand-500" value={title} onChange={(event) => onTitleChange(event.target.value)} maxLength={200} autoFocus /></label>
      {datasets.length ? <DatasetPicker datasets={datasets} profiles={profiles} value={datasetId} onChange={onDatasetChange} /> : <div className="rounded-xl bg-[#F5F5F7] p-4"><p className="m-0 text-sm font-medium text-[#3A3A3C]">No datasets uploaded yet.</p><p className="mb-4 mt-1 text-xs leading-5 text-[#6E6E73]">Upload a dataset before starting an analysis.</p><button className="inline-flex min-h-9 items-center rounded-lg border border-[#D2D2D7] bg-white px-3 text-xs font-medium text-[#3A3A3C] hover:bg-[#FAFAFB] disabled:opacity-50" type="button" onClick={onUpload} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload Dataset'}</button></div>}
    </div>
  );
}

function DatasetPicker({ datasets, profiles, value, onChange }) {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef(null);
  const selected = datasets.find((dataset) => dataset.id === value) ?? datasets[0];

  useEffect(() => {
    function close(event) {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !pickerRef.current?.contains(event.target))) setOpen(false);
    }
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, []);

  return <div className="grid gap-2" ref={pickerRef}>
    <span className="text-sm font-medium text-[#3A3A3C]" id="analysis-dataset-label">Dataset</span>
    <div className="relative min-w-0">
      <button className="flex min-h-13 w-full min-w-0 items-center gap-3 rounded-xl border border-[#D2D2D7] bg-white px-3 py-2 text-left transition hover:border-[#B8B8C0] focus:border-brand-500" type="button" aria-labelledby="analysis-dataset-label" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-[#1D1D1F]" title={selected?.original_file_name}>{selected?.original_file_name}</span><span className="mt-0.5 block truncate text-[11px] font-normal text-[#86868B]">{selected ? datasetMeta(selected, profiles?.[selected.id]) : 'Choose a dataset'}</span></span>
        <svg className={`h-4 w-4 shrink-0 text-[#86868B] transition ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      {open && <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 max-h-[min(14rem,35dvh)] overflow-y-auto overscroll-contain rounded-xl border border-[#DADAE0] bg-white p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.14)]" role="listbox" aria-labelledby="analysis-dataset-label">
        {datasets.map((dataset) => {
          const active = dataset.id === value;
          return <button className={`flex w-full min-w-0 items-center gap-3 rounded-lg border-0 px-3 py-2.5 text-left transition ${active ? 'bg-indigo-50' : 'bg-transparent hover:bg-[#F5F5F7]'}`} type="button" role="option" aria-selected={active} key={dataset.id} onClick={() => { onChange(dataset.id); setOpen(false); }}>
            <span className="min-w-0 flex-1"><span className={`block truncate text-[13px] font-medium ${active ? 'text-indigo-700' : 'text-[#1D1D1F]'}`} title={dataset.original_file_name}>{dataset.original_file_name}</span><span className="mt-0.5 block truncate text-[11px] text-[#86868B]">{datasetMeta(dataset, profiles?.[dataset.id])}</span></span>
            {active && <svg className="h-4 w-4 shrink-0 text-indigo-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3.5 8 3 3 6-6" /></svg>}
          </button>;
        })}
      </div>}
    </div>
  </div>;
}

function progressFromAgentRuns(agentRuns) {
  if (!agentRuns.length) return { label: 'Preparing your analysis…', detail: 'Loading the verified dataset profile.' };
  const latest = agentRuns.at(-1);
  if (latest.status === 'failed') return { label: 'Unable to finish this step', detail: 'Preparing a safe error response.' };
  if (latest.agent_name === 'supervisor' && latest.status === 'running') return { label: 'Understanding your question…', detail: 'Checking whether the dataset can support the request.' };
  if (latest.agent_name === 'supervisor') return { label: 'Question understood', detail: 'Selecting relevant dataset columns.' };
  if (latest.agent_name === 'profile_interpreter' && latest.status === 'running') return { label: 'Reviewing dataset context…', detail: 'Checking relevant columns and data-quality constraints.' };
  if (latest.agent_name === 'profile_interpreter') return { label: 'Dataset context reviewed', detail: 'Preparing a focused sequence of analysis tasks.' };
  if (latest.agent_name === 'planner' && latest.status === 'running') return { label: 'Building your analysis plan…', detail: 'Organizing methods, columns, and task dependencies.' };
  if (latest.agent_name === 'planner') return { label: 'Executing deterministic analysis…', detail: 'Loading the dataset and running validated analytical tools.' };
  if (latest.agent_name.startsWith('analyst:') && latest.status === 'running') return { label: 'Calculating evidence…', detail: 'Running a controlled analytical operation on the dataset.' };
  if (latest.agent_name.startsWith('analyst:')) return { label: 'Evidence calculated', detail: 'Checking whether statistical validation is required.' };
  if (latest.agent_name.startsWith('statistical_validator:') && latest.status === 'running') return { label: 'Validating statistics…', detail: 'Checking assumptions and running a deterministic statistical test.' };
  return { label: 'Preparing your results…', detail: 'Saving grounded evidence and formatting the final response.' };
}

async function loadResults(runs) {
  const completed = runs.filter((run) => run.status === 'completed');
  const entries = await Promise.all(completed.map(async (run) => {
    const [reportResult, chartResult] = await Promise.allSettled([
      analysisService.getReport(run.id),
      analysisService.listCharts(run.id),
    ]);
    return [run.id, {
      report: reportResult.status === 'fulfilled' ? reportResult.value : null,
      charts: chartResult.status === 'fulfilled' ? chartResult.value.items ?? [] : [],
    }];
  }));
  return Object.fromEntries(entries);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
