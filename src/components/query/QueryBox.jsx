import { useEffect, useRef, useState } from 'react';
import { ErrorMessage } from '../common/ErrorMessage';

export function QueryBox({ disabled, submitting, error, profileRequired, onProfile, onSubmit, draft }) {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [listening, setListening] = useState(false);
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

  useEffect(() => () => recognitionRef.current?.abort(), []);

  function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || listening || disabled || profileRequired || submitting) return;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = globalThis.navigator?.language || 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) setQuery((current) => `${current}${current.trim() ? ' ' : ''}${transcript}`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized || disabled || profileRequired || submitting) return;
    const succeeded = await onSubmit({ query: normalized, llm_provider: provider });
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
        {error && <div className="mb-3"><ErrorMessage message={error} /></div>}
        <div className="flex min-h-13 flex-wrap items-end gap-1.5 rounded-[20px] border border-[#DADAE0] bg-white px-2 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.045)] transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 sm:flex-nowrap sm:gap-2 sm:rounded-[26px] sm:pl-5">
          <label className="sr-only" htmlFor="analysis-query">Ask Tatparya about this dataset</label>
          <textarea ref={queryRef} className="custom-scrollbar block max-h-[120px] min-h-10 min-w-0 basis-full resize-none overflow-y-hidden border-0 bg-transparent px-2 py-2 text-sm leading-6 text-[#1D1D1F] outline-none placeholder:text-[#98989D] disabled:text-[#98989D] sm:flex-1 sm:basis-auto sm:px-0" id="analysis-query" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} maxLength={5000} rows={1} placeholder="Ask Tatparya…" disabled={disabled || profileRequired || submitting} />
          <select className="mb-1 ml-auto max-w-24 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent px-2 py-1.5 text-xs font-medium text-[#6E6E73] outline-none hover:bg-[#F2F2F4] disabled:cursor-not-allowed disabled:opacity-50 sm:ml-0" aria-label="Model provider" value={provider} onChange={(event) => setProvider(event.target.value)} disabled={submitting || disabled || profileRequired}><option value="gemini">Gemini</option><option value="groq">Groq</option></select>
          <button className={`mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border-0 bg-transparent transition hover:bg-[#F2F2F4] ${listening ? 'text-[#4338CA]' : 'text-[#515154]'}`} type="button" aria-label={listening ? 'Listening for your question' : 'Use voice input'} aria-pressed={listening} onClick={startVoiceInput} disabled={disabled || profileRequired || submitting}><MicIcon listening={listening} /></button>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-0 bg-[#4338CA] text-white transition hover:bg-[#3730A3] disabled:cursor-not-allowed disabled:bg-[#C7C7D1]" type="submit" aria-label={submitting ? 'Analyzing question' : 'Send question'} disabled={submitting || disabled || profileRequired || !query.trim()}>{submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <SendIcon />}</button>
        </div>
      </div>
    </form>
  );
}

function SendIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>;
}

function MicIcon({ listening }) {
  return <svg className={`h-5 w-5 ${listening ? 'animate-pulse' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6" /></svg>;
}
