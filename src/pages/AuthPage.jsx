import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/api';
import { GoogleSignIn } from '../components/GoogleSignIn';
import { BrandLogo } from '../components/common/BrandLogo';

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
      success(isRegister ? 'Your account is ready. Welcome to Tatparya!' : 'You’re logged in. Welcome back!');
      navigate(location.state?.from?.pathname ?? '/dashboard', { replace: true });
    } catch (requestError) {
      setError(getApiError(requestError).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#F7F7FA] px-5 py-6 text-[#1D1D2A] sm:px-8">
      <Link className="inline-flex self-start no-underline" to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link>
      <section className="my-auto w-full max-w-[420px] self-center rounded-2xl border border-[#E1E2E8] bg-white p-6 shadow-[0_18px_50px_-38px_rgba(36,32,90,0.35)] sm:p-9">
        <h1 className="mb-2 mt-0 text-[32px] font-semibold tracking-[-0.04em] text-[#171824]">{isRegister ? 'Create account' : 'Welcome back'}</h1>
        <p className="mb-7 text-sm leading-6 text-[#6A6C7D]">{isRegister ? 'Create your Tatparya account.' : 'Log in to your Tatparya account.'}</p>
        {import.meta.env.VITE_GOOGLE_SIGN_IN_ENABLED === 'true' && <GoogleSignIn />}
        <form onSubmit={submit} className="grid gap-5">
          {isRegister && <label className="grid gap-2 text-sm font-medium text-[#3F4151]">Name<input className="min-h-12 rounded-xl border border-[#D5D7E0] bg-white px-4 py-2 text-[#1D1D2A] transition hover:border-[#BFC2CE] focus:border-brand-500" name="name" value={form.name} onChange={update} autoComplete="name" required maxLength={255} /></label>}
          <label className="grid gap-2 text-sm font-medium text-[#3F4151]">Email<input className="min-h-12 rounded-xl border border-[#D5D7E0] bg-white px-4 py-2 text-[#1D1D2A] transition hover:border-[#BFC2CE] focus:border-brand-500" name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label>
          <label className="grid gap-2 text-sm font-medium text-[#3F4151]">Password<input className="min-h-12 rounded-xl border border-[#D5D7E0] bg-white px-4 py-2 text-[#1D1D2A] transition hover:border-[#BFC2CE] focus:border-brand-500" name="password" type="password" value={form.password} onChange={update} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} /></label>
          {!isRegister && <Link className="-mt-3 justify-self-end text-xs font-medium text-brand-600 hover:text-brand-700" to="/forgot-password">Forgot password?</Link>}
          <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting}>{submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
        </form>
        <p className="mb-0 mt-6 text-center text-sm text-[#77798A]">{isRegister ? 'Already have an account?' : 'New to Tatparya?'} <Link className="font-semibold text-brand-600 hover:text-brand-700" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create account'}</Link></p>
      </section>
    </main>
  );
}
