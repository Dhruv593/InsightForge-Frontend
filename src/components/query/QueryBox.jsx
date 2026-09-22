import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../common/ErrorMessage';

export function QueryBox({ disabled, submitting, error, profileRequired, insufficientCredits, onProfile, onSubmit, draft }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [queryFocused, setQueryFocused] = useState(false);
  const recognitionRef = useRef(null);
  const queryRef = useRef(null);

  useEffect(() => {
    if (!draft?.query) return;
    setQuery(draft.query);
    window.requestAnimationFrame(() => queryRef.current?.focus());
  }, [draft]);

  useEffect(() => {
    const textarea = queryRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const maximumHeight = 120;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maximumHeight)}px`;
    textarea.style.overflowY = textarea.scrollHeight > maximumHeight ? 'auto' : 'hidden';
  }, [query]);

  useEffect(() => () => {
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onstart = recognition.onresult = recognition.onend = recognition.onerror = null;
      recognition.abort();
    }
  }, []);

  useEffect(() => {
    if (disabled || profileRequired || insufficientCredits || submitting) recognitionRef.current?.abort();
  }, [disabled, profileRequired, insufficientCredits, submitting]);

  function startVoiceInput() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (disabled || profileRequired || submitting) return;
    setVoiceError('');
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser. You can type your question instead.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = globalThis.navigator?.language || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) setQuery((current) => `${current}${current.trim() ? ' ' : ''}${transcript}`);
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error === 'aborted') return;
      setVoiceError(event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Allow microphone access in your browser to use voice input.'
        : 'Voice input could not finish. Try again or type your question.');
    };
    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setVoiceError('Voice input could not start. Try again or type your question.');
    }
  }

  async function submit(event) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized || disabled || profileRequired || insufficientCredits || submitting) return;
    recognitionRef.current?.abort();
    const succeeded = await onSubmit({ query: normalized });
    if (succeeded) setQuery('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form className="bg-transparent px-2.5 py-2.5 sm:px-6 sm:py-3" onSubmit={submit}>
      <div className="mx-auto max-w-4xl">
        {profileRequired && <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><span>Profile this dataset before starting an analysis.</span><button className="border-0 bg-transparent p-0 font-medium text-brand-600 hover:text-brand-700" type="button" onClick={onProfile}>Profile dataset</button></div>}
        {!profileRequired && insufficientCredits && <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><span>You have no question credits left.</span><button className="shrink-0 border-0 bg-transparent p-0 font-semibold text-brand-600 hover:text-brand-700" type="button" onClick={() => navigate('/plans')}>Get more credits</button></div>}
        {error && <div className="mb-3"><ErrorMessage message={error} /></div>}
        {voiceError && <p className="mb-2 text-xs text-[#6E6E73]" role="status">{voiceError}</p>}
        <div className="flex min-h-13 flex-wrap items-end gap-1.5 rounded-[20px] border border-[#DADAE0] bg-white px-2 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.045)] transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 sm:flex-nowrap sm:gap-2 sm:rounded-[26px] sm:pl-5">
          <label className="sr-only" htmlFor="analysis-query">Ask Tatparya about this dataset</label>
          <textarea ref={queryRef} className="custom-scrollbar block max-h-[120px] min-h-10 min-w-0 basis-full resize-none overflow-y-hidden border-0 bg-transparent px-2 py-2 text-sm leading-6 text-[#1D1D1F] outline-none placeholder:text-[#98989D] disabled:text-[#98989D] sm:flex-1 sm:basis-auto sm:px-0" id="analysis-query" aria-describedby="analysis-query-help" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setQueryFocused(true)} onBlur={() => setQueryFocused(false)} onKeyDown={handleKeyDown} maxLength={5000} rows={1} placeholder={insufficientCredits ? 'Get more credits to ask another question' : 'Ask Tatparya…'} disabled={disabled || profileRequired || insufficientCredits || submitting} />
          <span className="sr-only" role="status">{listening ? 'Listening. Select the microphone again to stop.' : ''}</span>
          <button className={`mb-0.5 ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border-0 transition sm:ml-0 ${listening ? 'bg-indigo-50 text-[#4338CA] ring-1 ring-indigo-200' : 'bg-transparent text-[#515154] hover:bg-[#F2F2F4]'}`} type="button" aria-label={listening ? 'Stop voice input' : 'Use voice input'} aria-pressed={listening} onClick={startVoiceInput} disabled={disabled || profileRequired || insufficientCredits || submitting}><MicIcon listening={listening} /></button>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-0 bg-[#4338CA] text-white transition hover:bg-[#3730A3] disabled:cursor-not-allowed disabled:bg-[#C7C7D1]" type="submit" aria-label={submitting ? 'Analyzing question' : 'Send question'} disabled={submitting || disabled || profileRequired || insufficientCredits || !query.trim()}>{submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <SendIcon />}</button>
        </div>
        <p id="analysis-query-help" className={`mb-0 mt-1.5 px-4 text-[10px] text-[#86868B] transition-opacity ${queryFocused && !disabled && !profileRequired && !insufficientCredits ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>Enter to send · Shift + Enter for a new line</p>
      </div>
    </form>
  );
}

function SendIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>;
}

function MicIcon({ listening }) {
  if (listening) return <span className="voice-recording-bars" aria-hidden="true"><span /><span /><span /><span /></span>;
  return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" /></svg>;
}
