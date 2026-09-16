import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { accountService } from '../services/accountService';
import { getApiError } from '../services/api';

export function AccountPage() {
  const { user, refreshUser, clearSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [sessions, setSessions] = useState([]);
  const [busy, setBusy] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletion, setDeletion] = useState({ password: '', confirmation: '' });

  useEffect(() => { accountService.sessions().then((result) => setSessions(result.items ?? [])).catch(() => {}); }, []);

  async function saveProfile(event) {
    event.preventDefault(); setBusy('profile');
    try { await accountService.updateProfile({ name }); await refreshUser(); toast.success('Profile updated.'); }
    catch (error) { toast.error(getApiError(error).message); }
    finally { setBusy(''); }
  }

  async function changePassword(event) {
    event.preventDefault(); setBusy('password');
    try {
      await accountService.changePassword(passwords);
      toast.success('Password changed. Please log in again.');
      clearSession(); navigate('/login', { replace: true });
    } catch (error) { toast.error(getApiError(error).message); setBusy(''); }
  }

  async function signOutEverywhere() {
    setBusy('sessions');
    try { await accountService.revokeAllSessions(); clearSession(); navigate('/login', { replace: true }); }
    catch (error) { toast.error(getApiError(error).message); setBusy(''); }
  }

  async function revokeSession(sessionId) {
    setBusy(sessionId);
    try {
      await accountService.revokeSession(sessionId);
      setSessions((current) => current.map((item) => item.id === sessionId ? { ...item, revoked_at: new Date().toISOString() } : item));
      toast.success('Session signed out.');
    } catch (error) { toast.error(getApiError(error).message); }
    finally { setBusy(''); }
  }

  async function resendVerification() {
    setBusy('verification');
    try { await accountService.resendVerification(); toast.success('Verification email sent.'); }
    catch (error) { toast.error(getApiError(error).message); }
    finally { setBusy(''); }
  }

  async function deleteAccount() {
    setBusy('delete');
    try { await accountService.deleteAccount(deletion); clearSession(); navigate('/', { replace: true }); }
    catch (error) { toast.error(getApiError(error).message); setBusy(''); setDeleteOpen(false); }
  }

  return <div className="min-h-screen bg-[#F5F5F7] pt-14"><AppHeader /><main className="mx-auto grid max-w-4xl gap-5 px-4 py-8 sm:px-6"><header><p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-brand-600">Account</p><h1 className="m-0 text-3xl font-semibold tracking-[-0.03em] text-[#1D1D1F]">Manage your account</h1></header>
    <AccountCard title="Profile" description={user?.email}><form className="flex flex-col gap-3 sm:flex-row" onSubmit={saveProfile}><input className="min-h-10 flex-1 rounded-lg border border-[#D2D2D7] px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} required /><PrimaryButton busy={busy === 'profile'}>Save name</PrimaryButton></form>{!user?.is_email_verified && <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><span>Your email is not verified.</span><button className="border-0 bg-transparent font-semibold text-amber-900" type="button" onClick={resendVerification} disabled={busy === 'verification'}>{busy === 'verification' ? 'Sending…' : 'Send verification'}</button></div>}</AccountCard>
    <AccountCard title="Password" description={user?.password_configured === false ? 'Add a password to your Google account.' : 'Changing your password signs out all sessions.'}><form className="grid gap-3 sm:grid-cols-2" onSubmit={changePassword}><input className="min-h-10 rounded-lg border border-[#D2D2D7] px-3 text-sm" type="password" placeholder="Current password" value={passwords.current_password} onChange={(event) => setPasswords({ ...passwords, current_password: event.target.value })} /><input className="min-h-10 rounded-lg border border-[#D2D2D7] px-3 text-sm" type="password" minLength="8" placeholder="New password (8+ characters)" value={passwords.new_password} onChange={(event) => setPasswords({ ...passwords, new_password: event.target.value })} required /><div className="sm:col-span-2"><PrimaryButton busy={busy === 'password'}>Change password</PrimaryButton></div></form></AccountCard>
    <AccountCard title="Sessions" description={`${sessions.filter((item) => !item.revoked_at).length} active sign-in session(s)`}><div className="mb-4 grid gap-2">{sessions.filter((item) => !item.revoked_at).slice(0, 6).map((item) => <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F7F7F8] px-3 py-2.5" key={item.id}><div><p className="m-0 text-xs font-medium">Signed in {new Date(item.created_at).toLocaleDateString()}</p><p className="mb-0 mt-0.5 text-[11px] text-[#86868B]">Expires {new Date(item.expires_at).toLocaleDateString()}</p></div><button className="border-0 bg-transparent text-xs font-medium text-red-600" type="button" onClick={() => revokeSession(item.id)} disabled={busy === item.id}>{busy === item.id ? 'Signing out…' : 'Sign out'}</button></div>)}</div><button className="rounded-lg border border-[#D2D2D7] bg-white px-3 py-2 text-xs font-medium hover:bg-[#F7F7F8]" type="button" onClick={signOutEverywhere} disabled={Boolean(busy)}>Sign out everywhere</button></AccountCard>
    <AccountCard title="Delete account" description="Permanently remove your analyses, datasets, sessions, and account."><button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50" type="button" onClick={() => setDeleteOpen(true)}>Delete account</button></AccountCard>
  </main>{deleteOpen && <Modal title="Delete your account?" description="This action is permanent." danger confirmLabel="Delete account" confirmDisabled={deletion.confirmation !== 'DELETE'} busy={busy === 'delete'} onClose={() => setDeleteOpen(false)} onConfirm={deleteAccount}><div className="grid gap-3"><input className="min-h-10 rounded-lg border border-[#D2D2D7] px-3" type="password" placeholder="Password (if configured)" value={deletion.password} onChange={(event) => setDeletion({ ...deletion, password: event.target.value })} /><input className="min-h-10 rounded-lg border border-[#D2D2D7] px-3" placeholder="Type DELETE" value={deletion.confirmation} onChange={(event) => setDeletion({ ...deletion, confirmation: event.target.value })} /></div></Modal>}</div>;
}

function AccountCard({ title, description, children }) { return <section className="rounded-xl border border-[#E1E1E5] bg-white p-5"><h2 className="m-0 text-base font-semibold text-[#1D1D1F]">{title}</h2>{description && <p className="mb-4 mt-1 text-xs leading-5 text-[#6E6E73]">{description}</p>}{children}</section>; }
function PrimaryButton({ busy, children }) { return <button className="min-h-10 rounded-lg bg-brand-600 px-4 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50" type="submit" disabled={busy}>{busy ? 'Saving…' : children}</button>; }
