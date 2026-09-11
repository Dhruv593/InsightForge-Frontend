import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/api';
import { GoogleSignIn } from '../components/GoogleSignIn';

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { error: setError, success } = useToast();
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { email: form.email.trim(), password: form.password };
      if (isRegister) await register({ ...payload, name: form.name.trim() });
      else await login(payload);
      success(isRegister ? 'Your account is ready. Welcome to InsightForge!' : 'You’re logged in. Welcome back!');
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-rows-[auto_1fr] bg-slate-50 p-5 text-slate-900 sm:p-8">
      <Link className="inline-flex items-center gap-2.5 self-start justify-self-start text-lg font-semibold tracking-tight no-underline" to="/"><span className="grid h-8 w-8 place-items-center rounded-md bg-brand-600 text-[11px] font-bold text-white">IF</span>InsightForge</Link>
      <section className="-mt-10 w-full max-w-md self-center justify-self-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">{isRegister ? 'Create your workspace' : 'Welcome back'}</p>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-950">{isRegister ? 'Start exploring your data.' : 'Log in to InsightForge.'}</h1>
        <p className="mb-8 text-sm leading-6 text-slate-600">{isRegister ? 'Create an account to upload and profile your first dataset.' : 'Continue with your datasets and analyses.'}</p>
        {import.meta.env.VITE_GOOGLE_SIGN_IN_ENABLED === 'true' && <GoogleSignIn />}
        <form onSubmit={submit} className="grid gap-5">
          {isRegister && <label className="grid gap-2 text-sm font-medium text-slate-700">Name<input className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 transition focus:border-brand-500" name="name" value={form.name} onChange={update} autoComplete="name" required maxLength={255} /></label>}
          <label className="grid gap-2 text-sm font-medium text-slate-700">Email<input className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 transition focus:border-brand-500" name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Password<input className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 transition focus:border-brand-500" name="password" type="password" value={form.password} onChange={update} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} /></label>
          <button className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting}>{submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
        </form>
        <p className="mb-0 mt-6 text-center text-sm text-slate-500">{isRegister ? 'Already have an account?' : 'New to InsightForge?'} <Link className="font-semibold text-brand-600 hover:text-brand-700" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link></p>
      </section>
    </main>
  );
}
