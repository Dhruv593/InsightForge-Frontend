import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/api';
import { GoogleSignIn } from '../components/GoogleSignIn';
import { BrandLogo } from '../components/common/BrandLogo';
import { Seo } from '../components/common/Seo';

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { error: setError, success } = useToast();
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: '' }));
  };
  async function submit(event) {
    event.preventDefault();
    setError('');
    const nextErrors = {};
    if (isRegister && !form.name.trim()) {
      nextErrors.name = 'Enter your name.';
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
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
    <main className="flex min-h-[100dvh] flex-col bg-white px-5 py-4 text-[#1D1D2A] sm:bg-[#F7F7FA] sm:px-8 sm:py-6">
      <Seo title={`${isRegister ? 'Create account' : 'Log in'} — Tatparya`} description={isRegister ? 'Create a Tatparya account to start analyzing business data.' : 'Log in to your Tatparya workspace.'} path={isRegister ? '/register' : '/login'} noIndex />
      <Link className="inline-flex min-h-11 items-center self-start no-underline" to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link>
      <section className="mb-auto mt-10 w-full max-w-[420px] self-center bg-white py-3 sm:my-auto sm:rounded-2xl sm:border sm:border-[#E1E2E8] sm:p-9 sm:shadow-[0_18px_50px_-38px_rgba(36,32,90,0.35)]">
        <h1 className="mb-2 mt-0 text-[30px] font-semibold tracking-[-0.035em] text-[#171824] sm:text-[32px]">{isRegister ? 'Create account' : 'Welcome back'}</h1>
        <p className="mb-7 text-sm leading-6 text-[#6A6C7D]">{isRegister ? 'Create your Tatparya account.' : 'Log in to your Tatparya account.'}</p>
        {import.meta.env.VITE_GOOGLE_SIGN_IN_ENABLED === 'true' && <GoogleSignIn />}
        <form onSubmit={submit} className="grid gap-5">
          {isRegister && <label className="grid gap-2 text-sm font-medium text-[#3F4151]">Name<input className="min-h-12 rounded-xl border border-[#D5D7E0] bg-white px-4 py-2 text-[#1D1D2A] transition hover:border-[#BFC2CE] focus:border-brand-500" name="name" value={form.name} onChange={update} autoComplete="name" required minLength={1} maxLength={255} aria-invalid={Boolean(fieldErrors.name)} />{fieldErrors.name && <span className="text-xs font-normal text-red-600" role="alert">{fieldErrors.name}</span>}</label>}
          <label className="grid gap-2 text-sm font-medium text-[#3F4151]">Email<input className="min-h-12 rounded-xl border border-[#D5D7E0] bg-white px-4 py-2 text-[#1D1D2A] transition hover:border-[#BFC2CE] focus:border-brand-500" name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label>
          <label className="grid gap-2 text-sm font-medium text-[#3F4151]">Password<span className="relative"><input className="min-h-12 w-full rounded-xl border border-[#D5D7E0] bg-white py-2 pl-4 pr-14 text-[#1D1D2A] transition hover:border-[#BFC2CE] focus:border-brand-500" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={update} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={8} aria-invalid={Boolean(fieldErrors.password)} /><button className="absolute inset-y-0 right-1 my-auto min-h-11 rounded-lg border-0 bg-transparent px-3 text-xs font-semibold text-[#626477] hover:bg-[#F5F5F7]" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button></span>{fieldErrors.password ? <span className="text-xs font-normal text-red-600" role="alert">{fieldErrors.password}</span> : isRegister && <span className="text-xs font-normal text-[#77798A]">Use at least 8 characters.</span>}</label>
          {!isRegister && <Link className="-mt-3 justify-self-end text-xs font-medium text-brand-600 hover:text-brand-700" to="/forgot-password">Forgot password?</Link>}
          <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50" disabled={submitting}>{submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}</button>
        </form>
        <p className="mb-0 mt-6 text-center text-sm text-[#77798A]">{isRegister ? 'Already have an account?' : 'New to Tatparya?'} <Link className="font-semibold text-brand-600 hover:text-brand-700" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create account'}</Link></p>
        {isRegister && <p className="mb-0 mt-4 text-center text-[11px] leading-5 text-[#77798A]">By creating an account, you agree to the <Link className="underline hover:text-[#1D1D2A]" to="/terms">Terms</Link> and acknowledge the <Link className="underline hover:text-[#1D1D2A]" to="/privacy">Privacy Policy</Link>.</p>}
      </section>
    </main>
  );
}
