import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConversationWorkspace } from '../components/conversations/ConversationWorkspace';
import { DatasetProfile } from '../components/datasets/DatasetProfile';
import { DatasetPreviewDialog } from '../components/datasets/DatasetPreviewDialog';
import { DatasetLibrary } from '../components/datasets/DatasetLibrary';
import { NewAnalysisFields } from '../components/conversations/NewAnalysisFields';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/layout/Sidebar';
import { analysisService } from '../services/analysisService';
import { getApiError } from '../services/api';
import { conversationService } from '../services/conversationService';
import { datasetService } from '../services/datasetService';
import { profileService } from '../services/profileService';
import { usePersistentState } from '../hooks/usePersistentState';
import { useAuth } from '../context/AuthContext';
import { accountService } from '../services/accountService';
import { OnboardingTour, onboardingStepFor } from '../components/onboarding/OnboardingTour';
import { useDashboardWorkspace } from '../hooks/useDashboardWorkspace';

export function DashboardPage() {
  const { datasetId: routeDatasetId, conversationId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const emptyUploadRef = useRef(null);
  const [profiling, setProfiling] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [querySubmitting, setQuerySubmitting] = useState(false);
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

  const onboardingActive = Boolean(user && !user.onboarding_completed_at && !tourDismissed);
  const {
    datasets, setDatasets, datasetsLoading, datasetProfiles, setDatasetProfiles,
    conversations, setConversations, conversationsLoading,
    activeConversation, setActiveConversation, messages, setMessages,
    runs, setRuns, resultsByRun, conversationLoading,
    profile, setProfile, profileLoading, activeQueue, setActiveQueue,
    analysisProgress, setAnalysisProgress, selectedDatasetId, selectedDataset,
    profileComplete, loadDatasets, refreshActiveQueue,
  } = useDashboardWorkspace({
    routeDatasetId,
    conversationId,
    navigate,
    refreshUser,
    onboardingActive,
    setPageError,
  });
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
      void refreshActiveQueue();
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
      void refreshActiveQueue();
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
      void refreshActiveQueue();
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

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
