import { useCallback, useEffect, useRef, useState } from 'react';
import { analysisService } from '../services/analysisService';
import { getApiError } from '../services/api';
import { conversationService } from '../services/conversationService';
import { datasetService } from '../services/datasetService';
import { profileService } from '../services/profileService';

const ACTIVE_QUEUE_POLL_MS = 2500;
const IDLE_QUEUE_POLL_MS = 25000;

export function useDashboardWorkspace({
  routeDatasetId,
  conversationId,
  navigate,
  refreshUser,
  onboardingActive,
  setPageError,
}) {
  const activeQueueIdsRef = useRef(new Set());
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
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [activeQueue, setActiveQueue] = useState([]);

  const selectedDatasetId = routeDatasetId ?? activeConversation?.dataset_id ?? null;
  const selectedDataset = datasets.find((item) => item.id === selectedDatasetId) ?? null;
  const profileComplete = profile?.profile_status === 'completed';

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
      return [];
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
    if (!onboardingActive || datasetsLoading || conversationsLoading || !datasets.length || selectedDatasetId) return;
    navigate(`/dashboard/datasets/${datasets[0].id}`, { replace: true });
  }, [conversationsLoading, datasets, datasetsLoading, navigate, onboardingActive, selectedDatasetId]);

  const fetchActiveQueue = useCallback(async () => {
    try {
      const response = await analysisService.activeQueue();
      return response.items ?? [];
    } catch {
      // Conversation-specific polling remains available when this summary fails.
      return null;
    }
  }, []);

  const queueRefreshNowRef = useRef(fetchActiveQueue);
  useEffect(() => {
    let current = true;
    let timer;
    let generation = 0;

    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
    };
    const pollQueue = async () => {
      clearTimer();
      if (!current || document.visibilityState === 'hidden') return null;
      const pollGeneration = ++generation;
      const items = await fetchActiveQueue();
      if (!current || pollGeneration !== generation || document.visibilityState === 'hidden') return items;
      if (items !== null) {
        const nextIds = new Set(items.map((run) => run.id));
        const runFinished = [...activeQueueIdsRef.current].some((runId) => !nextIds.has(runId));
        activeQueueIdsRef.current = nextIds;
        setActiveQueue(items);
        if (runFinished) refreshUser().catch(() => undefined);
      }
      const hasActiveRuns = items === null ? activeQueueIdsRef.current.size > 0 : items.length > 0;
      timer = window.setTimeout(pollQueue, hasActiveRuns ? ACTIVE_QUEUE_POLL_MS : IDLE_QUEUE_POLL_MS);
      return items;
    };
    const refreshNow = () => {
      generation += 1;
      return pollQueue();
    };
    const handleVisibilityChange = () => {
      clearTimer();
      generation += 1;
      if (document.visibilityState === 'visible') void pollQueue();
    };

    queueRefreshNowRef.current = refreshNow;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    void pollQueue();
    return () => {
      current = false;
      generation += 1;
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchActiveQueue, refreshUser]);

  const refreshActiveQueue = useCallback(() => queueRefreshNowRef.current(), []);

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
        else setPageError(parsed.message);
      })
      .finally(() => current && setProfileLoading(false));
    return () => { current = false; };
  }, [selectedDatasetId, setPageError]);

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
    const clearTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = undefined;
    };
    const scheduleRefresh = (delay) => {
      clearTimer();
      if (current && document.visibilityState === 'visible') {
        timer = window.setTimeout(refreshActiveRuns, delay);
      }
    };
    const previouslyActiveIds = new Set(activeRunSignature.split('|').map((item) => item.split(':')[0]));
    const refreshActiveRuns = async () => {
      if (!current || document.visibilityState === 'hidden') return;
      try {
        const runResponse = await analysisService.listForConversation(conversationId);
        if (!current) return;
        const loadedRuns = runResponse.items ?? [];
        const active = loadedRuns.find((run) => ['pending', 'running'].includes(run.status));
        const completed = loadedRuns.some((next) => previouslyActiveIds.has(next.id) && !['pending', 'running'].includes(next.status));
        if (!active || completed) {
          const [messageResponse, results] = await Promise.all([
            conversationService.messages(conversationId),
            loadResults(loadedRuns),
          ]);
          if (!current) return;
          setMessages(messageResponse.items ?? []);
          setResultsByRun(results);
          if (completed) refreshUser().catch(() => undefined);
        }
        setRuns(loadedRuns);
        if (active?.status === 'pending') {
          const queued = await analysisService.queueStatus(active.id);
          if (current) setAnalysisProgress({ label: 'Waiting to begin…', detail: queued.queue_position ? `Your analysis is number ${queued.queue_position} in the queue.` : 'Your analysis is safely queued.' });
        } else if (active) {
          const agents = await analysisService.listAgentRuns(active.id);
          if (current) setAnalysisProgress(progressFromAgentRuns(agents.items ?? []));
        } else setAnalysisProgress(null);
      } catch {
        // A transient poll failure must not discard a queued server-side analysis.
      }
      scheduleRefresh(1400);
    };
    const handleVisibilityChange = () => {
      clearTimer();
      if (document.visibilityState === 'visible') scheduleRefresh(0);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    scheduleRefresh(350);
    return () => {
      current = false;
      clearTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversationId, activeRunSignature, refreshUser]);

  return {
    datasets, setDatasets, datasetsLoading, datasetProfiles, setDatasetProfiles,
    conversations, setConversations, conversationsLoading,
    activeConversation, setActiveConversation, messages, setMessages,
    runs, setRuns, resultsByRun, conversationLoading,
    profile, setProfile, profileLoading, activeQueue, setActiveQueue,
    analysisProgress, setAnalysisProgress, selectedDatasetId, selectedDataset,
    profileComplete, loadDatasets, refreshActiveQueue,
  };
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
