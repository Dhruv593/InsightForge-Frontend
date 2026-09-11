import { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const steps = [
  ['01', 'Bring your business data.', 'Upload a spreadsheet or data file. Get a clear view of its columns, missing entries, and data quality.', 'upload'],
  ['02', 'Ask what matters to you.', 'Ask a question in your own words. Explore revenue, compare regions, or understand changes over time.', 'question'],
  ['03', 'Take the answer with you.', 'Review the findings and supporting visuals. Download a PDF to share at your next business review.', 'report'],
];
const questions = [
  ['Sales performance', 'Which regions contribute the most to revenue?', 'Compare performance across the places you do business.'],
  ['Product performance', 'Which products are our strongest performers?', 'See which products lead and where to take a closer look.'],
  ['Business trends', 'How has revenue changed month by month?', 'Follow changes over time and investigate the patterns.'],
];
const faqs = [
  ['Do I need to know how to code?', 'No. Upload your data and ask a question in everyday language. InsightForge presents the results with findings and supporting charts when the data can support them.'],
  ['What files can I upload?', 'InsightForge supports CSV, Excel, JSON, and Parquet files. Start with a structured file that has clear column names, such as your sales or revenue export.'],
  ['Can I download my analysis?', 'Yes. When an analysis report is available, use Download PDF to save its findings, supporting visuals, and data notes.'],
  ['What happens if my data cannot answer a question?', 'InsightForge explains what could not be answered and shows available results where possible. Reports include data notes and limitations so you can judge the answer in context.'],
];

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white text-[#20212B] selection:bg-indigo-100">
      <header className="sticky top-0 z-20 border-b border-[#ECECF1] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 text-[13px] font-medium text-[#626374] lg:flex" aria-label="Main navigation">
            <a className="transition hover:text-brand-600" href="#product">Product</a><a className="transition hover:text-brand-600" href="#how-it-works">How it works</a><a className="transition hover:text-brand-600" href="#use-cases">Use cases</a><a className="transition hover:text-brand-600" href="#questions">FAQs</a>
          </nav>
          <div className="flex items-center gap-5"><Link className="hidden text-[13px] font-medium hover:text-brand-600 sm:block" to="/login">Log in</Link><Link className="rounded-full bg-brand-600 px-5 py-3 text-[13px] font-semibold text-white transition hover:bg-brand-700" to="/register">Get started <span className="ml-2" aria-hidden="true">↗</span></Link></div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-10 pt-16 sm:px-8 sm:pt-24 lg:pt-28">
          <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[420px] w-[420px] rounded-full bg-brand-600/10 blur-3xl sm:h-[560px] sm:w-[560px]" />
          <div className="relative mx-auto max-w-3xl text-center">
            <Eyebrow>BUILT FOR SMALL &amp; GROWING BUSINESSES</Eyebrow>
            <h1 className="mb-0 mt-5 text-[42px] font-semibold leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-[68px]">One workspace. A clearer picture of <span className="text-brand-600">your business.</span></h1>
            <p className="mx-auto mb-0 mt-6 max-w-xl text-base leading-7 text-[#696B7B] sm:text-lg sm:leading-8">Turn everyday spreadsheets into meaningful insights. Ask questions, explore your numbers, and share the story behind them.</p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <Link className="inline-flex items-center gap-4 rounded-full bg-brand-600 px-7 py-4 text-sm font-semibold text-white transition hover:bg-brand-700" to="/register">Get started <Arrow /></Link>
              <p className="m-0 text-xs text-[#898B98]">Upload your file. Ask naturally. No coding required.</p>
            </div>
          </div>

          <WorkspacePreview />

          <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-[#ECECF1] pt-8">
            <span className="text-xs text-[#898B98]">Works with the files you already use</span>
            {['CSV', 'Excel', 'JSON', 'Parquet'].map((format) => <span key={format} className="flex items-center gap-2 rounded-full border border-[#ECECF1] bg-[#FAFAFC] px-3 py-1.5 text-xs font-medium text-[#525468]"><Icon name="file" className="h-3.5 w-3.5 text-[#9395A5]" />{format}</span>)}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 bg-[#191827] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="max-w-2xl"><Eyebrow dark>A SIMPLER WAY TO WORK</Eyebrow><h2 className="mb-0 mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-[42px]">From a file on your desktop<br className="hidden sm:block" /> to a clearer view of your business.</h2></div>
            <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              <div aria-hidden="true" className="absolute left-0 right-0 top-[52px] hidden h-px bg-white/15 md:block" />
              {steps.map(([number, title, description, icon]) => (
                <article key={number} className="relative">
                  <div className="flex items-center gap-4">
                    <div className="relative z-10 grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl bg-brand-600 text-white shadow-[0_10px_30px_-12px_rgba(99,102,241,0.7)]"><Icon name={icon} className="h-5 w-5" /></div>
                    <span className="text-xs font-medium tabular-nums text-[#AAA7BE]">Step {number}</span>
                  </div>
                  <h3 className="mb-3 mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="m-0 max-w-sm text-sm leading-7 text-[#C0BECE]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#ECECF1] bg-[#F8F8FB]">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 sm:py-22">
            <Eyebrow>THE CONTEXT BEHIND THE NUMBERS</Eyebrow>
            <h2 className="mx-auto mb-4 mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-[42px]">A useful answer is more than a number.</h2>
            <p className="mx-auto mb-10 max-w-md text-base leading-7 text-[#737584]">Keep the question, the findings, and the supporting visuals together. Return to earlier questions without losing the context.</p>
            <div className="grid gap-5 text-left sm:grid-cols-3">{[
              ['chart', 'See the pattern', 'Charts make comparisons, contributions, and trends easier to follow.'],
              ['check', 'Understand the caveats', 'Data notes explain missing information and the limits of an answer.'],
              ['report', 'Share the full picture', 'Export a PDF with findings and supporting visuals in one report.'],
            ].map(([icon, title, description]) => <div key={title} className="rounded-2xl border border-[#E4E4EC] bg-white p-7"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-600/10 text-brand-600"><Icon name={icon} className="h-5 w-5" /></div><h3 className="mb-0 mt-5 text-base font-semibold">{title}</h3><p className="mb-0 mt-2 text-sm leading-6 text-[#737584]">{description}</p></div>)}</div>
            <Link className="mt-10 inline-flex items-center gap-3 text-sm font-semibold text-brand-600 hover:text-brand-700" to="/register">Explore your data <Arrow /></Link>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto mb-14 max-w-2xl text-center"><Eyebrow>ONE CONNECTED WORKFLOW</Eyebrow><h2 className="mb-4 mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-[42px]">From understanding your data to sharing your next insight.</h2><p className="m-0 text-sm leading-7 text-[#737584]">Everything stays together, so you can focus on your business questions.</p></div>
          <div className="flex flex-col gap-16 sm:gap-20">{[
            ['01 / DATA WORKSPACE', 'Start with a clear foundation.', 'Review the quality of your spreadsheet and see what is available to analyze.', '/dataset-preview.png', 'Dataset profile in InsightForge'],
            ['02 / ANALYSIS WORKSPACE', 'Make the numbers make sense.', 'Bring questions, visual comparisons, and follow-up conversations into one place.', '/analysis-preview.png', 'Analysis and supporting visuals in InsightForge'],
          ].map(([label, title, description, image, alt], index) => (
            <article key={label} className={`flex flex-col items-center gap-8 lg:gap-14 ${index % 2 ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
              <div className="lg:w-[42%]">
                <span className="inline-block rounded-full bg-brand-600/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-600">{label}</span>
                <h3 className="mb-3 mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h3>
                <p className="mb-5 max-w-md text-sm leading-7 text-[#737584]">{description}</p>
                <Link to="/register" className="inline-flex items-center gap-3 text-sm font-semibold text-brand-600 hover:text-brand-700">Get started <Arrow /></Link>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#E4E4EC] bg-[#FAFAFC] shadow-[0_24px_60px_-30px_rgba(35,30,70,0.35)] lg:w-[58%]">
                <img src={image} alt={alt} width="1847" height="1015" loading="lazy" className="block h-auto w-full" />
              </div>
            </article>
          ))}</div>
        </section>

        <section id="use-cases" className="scroll-mt-20 bg-[#232035] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><Eyebrow dark>START WITH A BUSINESS QUESTION</Eyebrow><h2 className="mb-0 mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-[42px]">What would you like to know?</h2></div><p className="m-0 max-w-xs text-sm leading-6 text-[#C0BECE]">A few starting points for your next analysis, when your data contains these fields.</p></div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">{questions.map(([label, question, description]) => <article className="flex flex-col rounded-xl border-l-2 border-brand-600 bg-white/5 p-6 sm:p-7" key={label}><p className="m-0 text-xs font-medium text-indigo-200">{label}</p><h3 className="mb-4 mt-6 text-xl font-medium leading-8 tracking-tight">{question}</h3><p className="mb-0 mt-auto text-sm leading-6 text-[#C0BECE]">{description}</p></article>)}</div>
          </div>
        </section>

        <section id="questions" className="mx-auto grid max-w-7xl scroll-mt-24 gap-8 border-t border-[#ECECF1] px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div><Eyebrow>A LITTLE MORE CLARITY</Eyebrow><h2 className="mb-0 mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-[40px]">Before you get started.</h2></div>
          <div>{faqs.map(([question, answer]) => <details key={question} className="group border-b border-[#E8E8EF] py-5 first:pt-0"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-sm font-semibold [&::-webkit-details-marker]:hidden group-open:text-brand-600">{question}<span className="text-xl font-normal text-[#9593AA] group-open:hidden" aria-hidden="true">+</span><span className="hidden text-xl font-normal text-brand-600 group-open:block" aria-hidden="true">−</span></summary><p className="mb-0 mt-4 max-w-xl text-sm leading-7 text-[#737584]">{answer}</p></details>)}</div>
        </section>

        <section className="px-5 pb-16 pt-4 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 rounded-2xl bg-[#28234A] px-7 py-12 text-white sm:px-12 md:flex-row md:items-center"><div><p className="mb-3 mt-0 text-xs font-medium text-[#B9B4D9]">YOUR NEXT QUESTION STARTS HERE</p><h2 className="m-0 text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl">Put your business data to work.</h2></div><Link className="inline-flex shrink-0 items-center gap-5 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#28234A] transition hover:bg-indigo-50" to="/register">Get started <Arrow /></Link></div></section>
      </main>
      <footer className="border-t border-[#ECECF1]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-8 sm:flex-row sm:items-center sm:px-8"><div><Brand /><p className="mb-0 mt-2 text-xs text-[#898B98]">A clearer view of your business data.</p></div><div className="flex items-center gap-6 text-xs text-[#737584]"><a className="hover:text-brand-600" href="#product">Product</a><Link className="hover:text-brand-600" to="/login">Log in</Link><span>© {new Date().getFullYear()} InsightForge</span></div></div></footer>
    </div>
  );
}

function WorkspacePreview() {
  const [active, setActive] = useState('analysis');
  const dialog = useRef(null);
  const screens = {
    analysis: { label: 'Explore an analysis', image: '/analysis-preview.png', title: 'Your question. The bigger picture.', description: 'Follow revenue trends, compare regions, and keep the conversation going—all in one workspace.', alt: 'InsightForge analysis screen with revenue trend and regional comparison charts.' },
    dataset: { label: 'Understand your data', image: '/dataset-preview.png', title: 'Know your data before you dive in.', description: 'Review the rows, columns, and quality of your file before starting your next analysis.', alt: 'InsightForge dataset profile showing row counts, columns, missing cells, and data quality notes.' },
  };
  const screen = screens[active];
  return (
    <div id="product" className="relative mx-auto mt-14 max-w-7xl scroll-mt-24 sm:mt-16">
      <div className="mb-6 flex justify-center" role="group" aria-label="Choose a product preview">
        <div className="inline-flex gap-1 rounded-full border border-[#E5E5ED] bg-[#F8F8FB] p-1">
          {Object.entries(screens).map(([key]) => <button key={key} type="button" aria-pressed={active === key} onClick={() => setActive(key)} className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:px-5 ${active === key ? 'bg-brand-600 text-white shadow-[0_6px_16px_-6px_rgba(99,102,241,0.6)]' : 'text-[#737584] hover:text-[#20212B]'}`}>{key === 'analysis' ? 'Analysis workspace' : 'Dataset overview'}</button>)}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E0F1] bg-[#F1F0F9] p-3 sm:p-6 lg:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center" aria-live="polite">
          <div><h2 className="m-0 text-lg font-semibold tracking-tight">{screen.title}</h2><p className="mb-0 mt-2 max-w-xl text-sm leading-6 text-[#696B7B]">{screen.description}</p></div>
          <button type="button" onClick={() => dialog.current.showModal()} className="shrink-0 self-start rounded-full border border-[#D9D6E8] bg-white px-4 py-2.5 text-xs font-medium transition hover:border-brand-600 hover:text-brand-600 sm:self-auto">View full screen ↗</button>
        </div>
        <button type="button" onClick={() => dialog.current.showModal()} aria-label={`Enlarge ${screen.label.toLowerCase()} screenshot`} className="relative block w-full cursor-zoom-in overflow-hidden rounded-xl border border-[#DFDDE9] bg-white shadow-[0_24px_60px_-24px_rgba(35,30,70,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
          <div className="flex items-center gap-1.5 border-b border-[#ECECF1] bg-[#FAFAFC] px-4 py-2.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-[#E4E4EC]" /><span className="h-2.5 w-2.5 rounded-full bg-[#E4E4EC]" /><span className="h-2.5 w-2.5 rounded-full bg-[#E4E4EC]" /></div>
          <img key={active} src={screen.image} width="1847" height="1015" fetchPriority="high" alt={screen.alt} className="block aspect-[1847/1015] w-full object-contain motion-safe:animate-[preview-reveal_250ms_ease-out]" />
        </button>
        <p className="relative mb-0 mt-4 text-center text-[11px] leading-5 text-[#77748F]">Product screenshots · Preview only. Results depend on your uploaded data.</p>
      </div>
      <dialog ref={dialog} className="fixed inset-0 m-auto max-h-[94dvh] w-[96vw] max-w-[1800px] overflow-auto rounded-xl border border-[#E2E0F1] bg-white p-3 shadow-xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-4"><p className="m-0 text-sm font-semibold">{screen.title}</p><button type="button" onClick={() => dialog.current.close()} className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50" autoFocus>Close ×</button></div>
        <img src={screen.image} width="1847" height="1015" alt={screen.alt} className="h-auto w-full" />
      </dialog>
    </div>
  );
}

function Brand() {
  return <Link className="inline-flex items-center gap-2.5 text-lg font-semibold tracking-tight no-underline" to="/" aria-label="InsightForge home"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-[10px] font-semibold tracking-normal text-white">IF</span>InsightForge</Link>;
}
function Eyebrow({ children, dark = false }) { return <p className={`m-0 text-[10px] font-semibold tracking-[0.15em] sm:text-[11px] ${dark ? 'text-indigo-200' : 'text-brand-600'}`}>{children}</p>; }
function Arrow() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>; }
function Icon({ name, className }) {
  const paths = { upload: 'M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5', question: 'M5 4h14v12H9l-4 4V4m4 4h6m-6 4h4', report: 'M6 3h9l4 4v14H6V3m8 0v5h5M9 12h7m-7 4h7', file: 'M6 3h9l4 4v14H6V3m8 0v5h5', chart: 'M4 3v17h17M8 15v-4m5 4V7m5 8V4', check: 'm4 12 5 5L20 6' };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}