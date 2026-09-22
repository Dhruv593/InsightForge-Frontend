import { useLayoutEffect, useState } from 'react';

const STEPS = {
  upload: {
    index: 0,
    target: 'upload-dataset',
    title: 'Upload your first dataset',
    description: 'Choose a CSV, Excel, JSON, or Parquet file to begin.',
    instruction: 'Select Upload Dataset to continue.',
  },
  profile: {
    index: 1,
    target: 'profile-dataset',
    title: 'Profile your dataset',
    description: 'Tatparya will check the columns and data quality before analysis.',
    instruction: 'Select Profile dataset to continue.',
  },
  analysis: {
    index: 2,
    target: 'new-analysis',
    title: 'Create your first analysis',
    description: 'Give the analysis a name to keep its questions, visuals, and findings together.',
    instruction: 'Select New Analysis to finish.',
  },
};

export function onboardingStepFor({ datasets, datasetProfiles }) {
  if (!datasets.length) return 'upload';
  if (!datasets.some((dataset) => datasetProfiles?.[dataset.id]?.profile_status === 'completed')) return 'profile';
  return 'analysis';
}

export function OnboardingTour({ step, hidden = false, onSkip }) {
  const details = STEPS[step] ?? STEPS.upload;
  const [placement, setPlacement] = useState(null);

  useLayoutEffect(() => {
    if (hidden) {
      setPlacement(null);
      return undefined;
    }
    let timer;
    let frame;
    let stopped = false;
    const measure = () => {
      const target = document.querySelector(`[data-tour="${details.target}"]`);
      if (!target) {
        timer = window.setTimeout(measure, 120);
        return;
      }
      const rect = target.getBoundingClientRect();
      const width = Math.min(288, window.innerWidth - 20);
      const estimatedHeight = 178;
      const gap = 10;
      const above = rect.bottom + gap + estimatedHeight > window.innerHeight && rect.top > estimatedHeight + gap;
      const next = {
        left: Math.max(10, Math.min(window.innerWidth - width - 10, rect.left + rect.width / 2 - width / 2)),
        top: above ? Math.max(10, rect.top - estimatedHeight - gap) : Math.min(window.innerHeight - estimatedHeight - 10, rect.bottom + gap),
        width,
        above,
      };
      if (!stopped) setPlacement((current) => current && current.left === next.left && current.top === next.top && current.width === next.width && current.above === next.above ? current : next);
    };
    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('resize', scheduleMeasure);
    window.addEventListener('scroll', scheduleMeasure, true);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', scheduleMeasure);
      window.removeEventListener('scroll', scheduleMeasure, true);
    };
  }, [details.target, hidden]);

  if (hidden || !placement) return null;

  return <section className="fixed z-[70] rounded-lg border border-slate-200 bg-white p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.16)]" style={{ left: placement.left, top: placement.top, width: placement.width }} role="status" aria-label="Getting started tour">
    <span className={`absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-slate-200 bg-white ${placement.above ? '-bottom-1.5 border-b border-r' : '-top-1.5 border-l border-t'}`} aria-hidden="true" />
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-1" aria-label={`Step ${details.index + 1} of 3`}>{Object.values(STEPS).map((item) => <span className={`h-1 w-6 rounded-full ${item.index <= details.index ? 'bg-indigo-600' : 'bg-slate-200'}`} key={item.title} />)}</div>
      <button className="-mr-1.5 -mt-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-0 bg-transparent text-base text-slate-400 hover:bg-slate-100 hover:text-slate-700" type="button" onClick={onSkip} aria-label="Skip tour">×</button>
    </div>
    <p className="mb-0.5 mt-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-indigo-600">Step {details.index + 1} of 3</p>
    <h2 className="m-0 text-[15px] font-semibold text-slate-950">{details.title}</h2>
    <p className="mb-0 mt-1 text-xs leading-5 text-slate-600">{details.description}</p>
    <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
      <button className="border-0 bg-transparent p-0 text-xs font-semibold text-slate-500 hover:text-slate-900" type="button" onClick={onSkip}>Skip tour</button>
      <span className="text-right text-[11px] font-medium text-indigo-700">{details.instruction}</span>
    </div>
  </section>;
}
