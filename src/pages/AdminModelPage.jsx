import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminSettingsService } from '../services/adminSettingsService';
import { getApiError } from '../services/api';

export function AdminModelPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!user?.is_admin) return undefined;
    let active = true;
    setLoading(true);
    setError('');
    adminSettingsService.getModel().then((response) => {
      if (active) { setSettings(response); setProvider(response.provider); }
    }).catch((failure) => {
      if (active) setError(getApiError(failure, 'AI model settings could not be loaded.').message);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.is_admin, reload]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await adminSettingsService.updateModel(provider);
      setSettings(response);
      setProvider(response.provider);
      toast.success('AI model updated for all new analyses and retries.');
    } catch (failure) {
      toast.error(getApiError(failure, 'AI model settings could not be saved.').message);
    } finally { setSaving(false); }
  }

  const selected = settings?.options.find((option) => option.provider === provider);
  return <AdminShell><div className="mx-auto grid max-w-3xl gap-6">
    <header><h2 className="m-0 text-3xl font-semibold tracking-[-0.035em] text-[#1D1D1F]">AI model</h2><p className="mb-0 mt-2 text-sm leading-6 text-[#6E6E73]">Choose the model used for analyses across Tatparya.</p></header>
    {loading ? <div className="h-56 rounded-2xl bg-white motion-safe:animate-pulse" role="status"><span className="sr-only">Loading AI model settings</span></div> : error ? <div className="rounded-xl border border-red-100 bg-red-50 p-5"><p className="m-0 text-sm text-red-700" role="alert">{error}</p><button className="mt-3 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700" type="button" onClick={() => setReload((value) => value + 1)}>Try again</button></div> : settings && <form className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-7" onSubmit={save}>
      <fieldset className="m-0 min-w-0 border-0 p-0" disabled={saving}><legend className="mb-4 text-sm font-semibold">Analysis provider</legend><div className="grid gap-3 sm:grid-cols-2">{settings.options.map((option) => <label key={option.provider} className={`flex min-w-0 items-start gap-3 rounded-xl border p-4 transition ${option.configured ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'} ${provider === option.provider ? 'border-brand-500 bg-brand-50' : 'border-[#E1E1E5] bg-white hover:border-[#C8C8CE]'}`}>
        <input className="mt-1 accent-[#4338CA]" type="radio" name="provider" value={option.provider} checked={provider === option.provider} onChange={() => setProvider(option.provider)} disabled={!option.configured} />
        <span className="min-w-0"><span className="block text-sm font-semibold text-[#1D1D1F]">{option.label}</span><span className="mt-1 block break-all text-xs leading-5 text-[#6E6E73]">{option.model || 'No model configured'}</span><span className="mt-3 block text-[11px] text-[#6E6E73]">{!option.configured ? 'Server configuration required' : settings.provider === option.provider ? 'Currently selected' : 'Configured on the server'}</span></span>
      </label>)}</div></fieldset>
      <p className="mb-0 mt-5 text-xs leading-5 text-[#6E6E73]">Changes apply to new analyses and retries for every user. Queued and running analyses keep their original provider.</p>
      <p className="mb-0 mt-2 text-xs leading-5 text-[#86868B]">Model names and API keys are configured in the server environment. This setting never exposes or changes API keys.</p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#ECECEF] pt-5"><span className="text-xs text-[#86868B]">{settings.updated_at ? `Last updated ${new Date(settings.updated_at).toLocaleString()}` : 'Using the server default until saved.'}</span><button className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={saving || !selected?.configured || (provider === settings.provider && Boolean(settings.updated_at))}>{saving ? 'Saving…' : 'Save model'}</button></div>
    </form>}
  </div></AdminShell>;
}
