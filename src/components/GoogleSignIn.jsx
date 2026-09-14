import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { getApiError } from '../services/api';

let libraryPromise;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!libraryPromise) {
    libraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      const timeout = window.setTimeout(() => { script.remove(); reject(new Error('Google loading timed out')); }, 15000);
      script.onload = () => { window.clearTimeout(timeout); resolve(); };
      script.onerror = () => { window.clearTimeout(timeout); script.remove(); reject(new Error('Google could not load')); };
      document.head.appendChild(script);
    }).catch((error) => { libraryPromise = null; throw error; });
  }
  return libraryPromise;
}

export function GoogleSignIn() {
  const container = useRef(null);
  const pending = useRef(false);
  const [status, setStatus] = useState('loading');
  const [slowStart, setSlowStart] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { googleLogin } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    let slowStartTimer;
    async function initialize() {
      try {
        const apiHost = new window.URL(import.meta.env.VITE_API_BASE_URL, window.location.origin).hostname;
        const pageHost = window.location.hostname;
        const localHosts = ['localhost', '127.0.0.1'];
        if (localHosts.includes(apiHost) && localHosts.includes(pageHost) && apiHost !== pageHost) {
          setStatus('error');
          showError(`Google sign-in requires matching local hostnames. Set VITE_API_BASE_URL to http://${pageHost}:8000/api/v1, then restart the frontend.`);
          return;
        }
        setSlowStart(false);
        slowStartTimer = window.setTimeout(() => active && setSlowStart(true), 3500);
        const [, challenge] = await Promise.all([
          loadGoogle(),
          authService.googleChallenge(),
        ]);
        if (!active) return;
        window.clearTimeout(slowStartTimer);
        setSlowStart(false);
        window.google.accounts.id.initialize({
          client_id: challenge.client_id,
          nonce: challenge.nonce,
          auto_select: false,
          callback: async ({ credential }) => {
            if (!active || pending.current) return;
            pending.current = true;
            setStatus('signing-in');
            try {
              await googleLogin(credential);
              if (!active) return;
              success('You’re signed in. Welcome to InsightForge!');
              navigate('/dashboard', { replace: true });
            } catch (error) {
              if (active) {
                showError(getApiError(error, 'Google sign-in failed. Please try again.').message);
                setStatus('error');
              }
            } finally { pending.current = false; }
          },
        });
        container.current.replaceChildren();
        window.google.accounts.id.renderButton(container.current, { theme: 'outline', size: 'large', text: 'continue_with', width: Math.min(320, container.current.parentElement.clientWidth) });
        setStatus('ready');
      } catch (error) {
        window.clearTimeout(slowStartTimer);
        if (active) {
          setStatus('error');
          showError(getApiError(error, 'Google sign-in could not load. You can still use email and password.').message);
        }
      }
    }
    initialize();
    return () => { active = false; window.clearTimeout(slowStartTimer); };
  }, [attempt, googleLogin, navigate, showError, success]);

  return <div className="mb-6">
    <div ref={container} className={`flex min-h-11 justify-center ${status !== 'ready' ? 'hidden' : ''}`} />
    {status === 'loading' && <div role="status" className="flex min-h-11 items-center justify-center gap-2 text-center text-sm text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" aria-hidden="true" /><span>{slowStart ? 'Starting the sign-in service. This can take up to a minute on free hosting…' : 'Preparing Google sign-in…'}</span></div>}
    {status === 'signing-in' && <p role="status" className="text-center text-sm text-slate-500">Signing you in…</p>}
    {status === 'error' && <button type="button" className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50" onClick={() => { setStatus('loading'); setAttempt((value) => value + 1); }}>Retry Google sign-in</button>}
    <div className="mt-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or continue with email<span className="h-px flex-1 bg-slate-200" /></div>
  </div>;
}
