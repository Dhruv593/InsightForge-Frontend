import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminUserService } from '../services/adminUserService';
import { getApiError } from '../services/api';

export function AdminUsersPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.is_admin) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      adminUserService.list(search).then((response) => setUsers(response.items ?? [])).catch((failure) => setError(getApiError(failure, 'Users could not be loaded.').message)).finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, user?.is_admin]);

  if (!user?.is_admin) return <Navigate to="/dashboard" replace />;

  async function changeAccess(target, nextValue) {
    setChangingId(target.id);
    try {
      const updated = await adminUserService.setAdminAccess(target.id, nextValue);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast.success(nextValue ? 'Admin access assigned.' : 'Admin access removed.');
    } catch (failure) {
      toast.error(getApiError(failure, 'Admin access could not be updated.').message);
    } finally { setChangingId(null); }
  }

  async function adjustCredits(target, delta, reason) {
    setChangingId(target.id);
    try {
      const updated = await adminUserService.adjustCredits(target.id, delta, reason);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
      if (updated.id === user.id) refreshUser().catch(() => undefined);
      toast.success(`${Math.abs(delta)} credit${Math.abs(delta) === 1 ? '' : 's'} ${delta > 0 ? 'added' : 'removed'}.`);
      return true;
    } catch (failure) {
      toast.error(getApiError(failure, 'Credits could not be updated.').message);
      return false;
    } finally { setChangingId(null); }
  }

  return <AdminShell><div className="mx-auto grid max-w-5xl gap-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="m-0 text-3xl font-semibold tracking-[-0.035em] text-[#1D1D1F]">Users & access</h2><p className="mb-0 mt-2 text-sm leading-6 text-[#6E6E73]">Review verification status and control who can access the admin dashboard.</p></div><input className="min-h-10 w-full rounded-xl border border-[#D2D2D7] bg-white px-3 text-sm outline-none focus:border-brand-500 sm:w-64" type="search" placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} /></header>
    <section className="overflow-hidden rounded-2xl border border-[#E1E1E5] bg-white">
      {loading ? <p className="m-0 p-6 text-sm text-[#6E6E73]">Loading users…</p> : error ? <p className="m-0 p-6 text-sm text-red-700" role="alert">{error}</p> : users.length === 0 ? <p className="m-0 p-6 text-sm text-[#6E6E73]">No users found.</p> : <div className="divide-y divide-[#ECECEF]">{users.map((item) => {
        const protectedRole = item.id === user.id || item.admin_managed_by_environment;
        const hasAssignedAccess = item.admin_access || item.admin_managed_by_environment;
        return <article className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center sm:px-6" key={item.id}>
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-semibold text-[#1D1D1F]">{item.name}</span>{hasAssignedAccess && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">{item.is_admin ? 'Admin' : 'Admin pending verification'}</span>}<span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.is_email_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.is_email_verified ? 'Email verified' : 'Email not verified'}</span></div><p className="mb-0 mt-1 truncate text-xs text-[#6E6E73]">{item.email}</p><p className="mb-0 mt-1 text-[11px] text-[#86868B]">{item.credits} credits</p></div>
          <CreditEditor name={item.name} value={item.credits} saving={changingId === item.id} onAdjust={(delta, reason) => adjustCredits(item, delta, reason)} />
          <button className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${hasAssignedAccess ? 'border-red-200 bg-white text-red-600 hover:bg-red-50' : 'border-brand-600 bg-brand-600 text-white hover:bg-brand-700'}`} type="button" disabled={protectedRole || changingId === item.id} title={item.id === user.id ? 'You cannot change your own access' : item.admin_managed_by_environment ? 'Managed by server environment' : undefined} onClick={() => changeAccess(item, !hasAssignedAccess)}>{changingId === item.id ? 'Saving…' : hasAssignedAccess ? 'Remove admin' : 'Make admin'}</button>
        </article>;
      })}</div>}
    </section>
  </div></AdminShell>;
}

function CreditEditor({ name, value, saving, onAdjust }) {
  const [draft, setDraft] = useState(String(value));
  const [reason, setReason] = useState('');

  useEffect(() => setDraft(String(value)), [value]);

  async function commit() {
    if (draft === '') {
      setDraft(String(value));
      return;
    }
    const nextValue = Number(draft);
    if (!Number.isSafeInteger(nextValue) || nextValue < 0) {
      setDraft(String(value));
      return;
    }
    const delta = nextValue - value;
    if (delta === 0) {
      setDraft(String(value));
      return;
    }
    if (reason.trim().length < 3) {
      setDraft(String(value));
      return;
    }
    if (await onAdjust(delta, reason.trim())) setReason('');
    else setDraft(String(value));
  }

  const reasonReady = reason.trim().length >= 3;
  async function quickAdjust(delta) {
    if (!reasonReady) return;
    if (await onAdjust(delta, reason.trim())) setReason('');
  }

  return <div className="grid gap-2">
    <input className="h-8 w-44 rounded-lg border border-[#DADAE0] bg-white px-2 text-[11px] outline-none focus:border-brand-500 disabled:bg-[#F7F7F8]" type="text" maxLength="240" placeholder="Reason for credit change" aria-label={`Reason for changing ${name}'s credits`} value={reason} disabled={saving} onChange={(event) => setReason(event.target.value)} />
    <div className="inline-flex w-fit items-center overflow-hidden rounded-lg border border-[#DADAE0] bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-50">
      <button className="h-9 w-9 border-0 bg-transparent text-base text-[#515154] hover:bg-[#F5F5F7] disabled:opacity-40" type="button" aria-label={`Remove one credit from ${name}`} disabled={saving || value < 1 || !reasonReady} onClick={() => quickAdjust(-1)}>−</button>
      <input className="h-9 w-16 border-x border-y-0 border-[#ECECEF] bg-white px-1 text-center text-xs font-semibold text-[#3A3A3C] outline-none disabled:bg-[#F7F7F8]" type="text" inputMode="numeric" pattern="[0-9]*" aria-label={`Credits for ${name}`} value={draft} disabled={saving} onChange={(event) => { if (/^\d*$/.test(event.target.value)) setDraft(event.target.value); }} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
      <button className="h-9 w-9 border-0 bg-transparent text-base text-[#515154] hover:bg-[#F5F5F7] disabled:opacity-40" type="button" aria-label={`Add one credit to ${name}`} disabled={saving || !reasonReady} onClick={() => quickAdjust(1)}>+</button>
    </div>
  </div>;
}
