export function PlansComingSoon({ currentCredits, onBack }) {
  return <section className="w-full rounded-3xl border border-[#E1E1E5] bg-white p-7 text-center shadow-[0_14px_50px_rgba(0,0,0,0.06)] sm:p-12">
    <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-lg font-semibold text-brand-600">{currentCredits}</span>
    <h1 className="mb-0 mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#1D1D1F] sm:text-4xl">More credits are coming soon.</h1>
    <p className="mx-auto mb-0 mt-4 max-w-xl text-sm leading-6 text-[#6E6E73]">You currently have {currentCredits} question credits. We are preparing flexible plans so you can add more credits to your Tatparya account.</p>
    <button className="mt-8 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700" type="button" onClick={onBack}>Back to workspace</button>
  </section>;
}
