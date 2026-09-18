import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { accountService } from '../services/accountService';
import { getApiError } from '../services/api';
import { BrandLogo } from '../components/common/BrandLogo';
import { Seo } from '../components/common/Seo';

export function AccountRecoveryPage({ mode }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const reset = mode === 'reset';
  const verify = mode === 'verify';

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (verify) {
        await accountService.verifyEmail(params.get('token') || '');
        setMessage('Your email has been verified.');
      } else if (reset) {
        await accountService.resetPassword(params.get('token') || '', value);
        setMessage('Your password has been reset. You can now log in.');
      } else {
        await accountService.forgotPassword(value.trim());
        setMessage('If an account exists for that email, a reset link has been sent.');
      }
    } catch (requestError) { setError(getApiError(requestError).message); }
    finally { setBusy(false); }
  }

  return <main className="grid min-h-screen place-items-center bg-[#F5F5F7] p-5"><Seo title={`${verify ? 'Verify email' : reset ? 'Reset password' : 'Forgot password'} — Tatparya`} description="Secure Tatparya account recovery." path={window.location.pathname} noIndex /><section className="w-full max-w-md rounded-xl border border-[#E1E1E5] bg-white p-7 shadow-sm"><Link className="mb-8 inline-flex no-underline" to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link><h1 className="mb-2 text-2xl font-semibold">{verify ? 'Verify your email' : reset ? 'Choose a new password' : 'Reset your password'}</h1><p className="mb-6 text-sm leading-6 text-[#6E6E73]">{verify ? 'Confirm this email address for your account.' : reset ? 'Use at least eight characters.' : 'We’ll send a secure reset link if the account exists.'}</p>{message ? <div><p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p><button className="mt-3 min-h-10 w-full rounded-lg bg-brand-600 text-sm font-semibold text-white" onClick={() => navigate('/login')}>Continue to login</button></div> : <form className="grid gap-4" onSubmit={submit}>{!verify && <input className="min-h-11 rounded-lg border border-[#D2D2D7] px-3 text-sm" type={reset ? 'password' : 'email'} minLength={reset ? 8 : undefined} placeholder={reset ? 'New password' : 'Email address'} value={value} onChange={(event) => setValue(event.target.value)} required />}{error && <p className="m-0 text-sm text-red-600">{error}</p>}<button className="min-h-11 rounded-lg bg-brand-600 text-sm font-semibold text-white disabled:opacity-50" disabled={busy}>{busy ? 'Please wait…' : verify ? 'Verify email' : reset ? 'Reset password' : 'Send reset link'}</button></form>}</section></main>;
}
