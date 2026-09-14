import { useState } from 'react';
import { ErrorMessage } from '../common/ErrorMessage';

export function QueryBox({ disabled, submitting, error, profileRequired, onProfile, onSubmit }) {
  const [query, setQuery] = useState('');
  const [provider, setProvider] = useState('gemini');

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
    <form className="bg-transparent px-4 py-2 sm:px-6" onSubmit={submit}>
      <div className="mx-auto max-w-3xl">
        {profileRequired && <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900"><span>Profile this dataset before starting an analysis.</span><button className="border-0 bg-transparent p-0 font-medium text-brand-600 hover:text-brand-700" type="button" onClick={onProfile}>Profile dataset</button></div>}
        {error && <div className="mb-3"><ErrorMessage message={error} /></div>}
        <div className="rounded-2xl border border-[#D2D2D7] bg-white p-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.045)] transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
          <label className="sr-only" htmlFor="analysis-query">Ask InsightForge about this dataset</label>
          <textarea className="block max-h-24 min-h-8 w-full resize-none border-0 bg-transparent px-2 py-1.5 text-[13px] leading-6 text-[#1D1D1F] outline-none placeholder:text-[#98989D] disabled:text-[#98989D]" id="analysis-query" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={handleKeyDown} maxLength={5000} rows={1} placeholder="Ask a follow-up question…" disabled={disabled || profileRequired || submitting} />
          <div className="flex items-center justify-between gap-3 pt-1.5">
            <select className="rounded-lg border-0 bg-[#F5F5F7] px-2.5 py-1.5 text-[11px] font-medium text-[#515154] outline-none hover:bg-[#ECECEF]" id="provider" aria-label="Model provider" value={provider} onChange={(event) => setProvider(event.target.value)} disabled={submitting || profileRequired}><option value="gemini">Gemini</option><option value="groq">Groq</option></select>
            <button className="inline-flex min-h-8 items-center justify-center rounded-lg bg-[#4338CA] px-4 text-[11px] font-semibold text-white transition hover:bg-[#3730A3] disabled:cursor-not-allowed disabled:opacity-40" type="submit" disabled={submitting || disabled || profileRequired || !query.trim()}>{submitting ? 'Analyzing…' : 'Send'}</button>
          </div>
        </div>
      </div>
    </form>
  );
}
