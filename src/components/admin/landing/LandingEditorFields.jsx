export function EditorSection({ title, description, children }) {
  return <section className="rounded-2xl border border-[#E1E1E5] bg-white p-5 sm:p-6"><div className="mb-5 border-b border-[#ECECEF] pb-4"><h2 className="m-0 text-lg font-semibold tracking-[-0.02em]">{title}</h2><p className="mb-0 mt-1 text-xs leading-5 text-[#6E6E73]">{description}</p></div><div className="grid gap-4">{children}</div></section>;
}

export function VisibilityToggle({ enabled, onChange, section }) {
  return <section className="flex items-center justify-between gap-5 rounded-2xl border border-[#E1E1E5] bg-white p-5"><div><h3 className="m-0 text-sm font-semibold">Show {section}</h3><p className="mb-0 mt-1 text-xs text-[#6E6E73]">{enabled ? 'This section is visible on the public landing page.' : 'This section is hidden from the public landing page.'}</p></div><button className={`relative h-7 w-12 shrink-0 rounded-full border-0 transition ${enabled ? 'bg-brand-600' : 'bg-[#D2D2D7]'}`} type="button" role="switch" aria-checked={enabled} onClick={() => onChange(!enabled)}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? 'left-6' : 'left-1'}`} /></button></section>;
}

export function SettingToggle({ enabled, onChange, title, description }) {
  return <div className="flex items-center justify-between gap-5 rounded-xl border border-[#E1E1E5] bg-[#FAFAFB] p-4"><div><h3 className="m-0 text-xs font-semibold">{title}</h3><p className="mb-0 mt-1 text-[11px] leading-5 text-[#6E6E73]">{description}</p></div><button className={`relative h-7 w-12 shrink-0 rounded-full border-0 transition ${enabled ? 'bg-brand-600' : 'bg-[#D2D2D7]'}`} type="button" role="switch" aria-label={title} aria-checked={enabled} onClick={() => onChange(!enabled)}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? 'left-6' : 'left-1'}`} /></button></div>;
}

export function ThemeSelect({ value, onChange }) {
  return <label className="grid min-w-32 gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#86868B]">Background<select className="min-h-10 rounded-lg border border-[#D2D2D7] bg-white px-3 text-xs font-semibold normal-case tracking-normal text-[#3A3A3C] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" value={value || 'light'} onChange={(event) => onChange(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></label>;
}

export function TwoColumns({ children }) { return <div className="grid gap-3 sm:grid-cols-2">{children}</div>; }

export function Field({ label, value, onChange, multiline = false, required = true }) {
  const Component = multiline ? 'textarea' : 'input';
  return <label className="grid gap-1.5 text-xs font-medium text-[#3A3A3C]"><span>{label}</span><Component className={`w-full rounded-lg border border-[#D2D2D7] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${multiline ? 'min-h-24 resize-y leading-6' : 'min-h-10'}`} value={value} onChange={(event) => onChange(event.target.value)} required={required} /></label>;
}

export function LinkFields({ title, value, path, update }) {
  return <fieldset className="rounded-xl border border-[#E1E1E5] p-4"><legend className="px-1 text-xs font-semibold">{title}</legend><TwoColumns><Field label="Button label" value={value.label} onChange={(next) => update(`${path}.label`, next)} /><Field label="Destination (/path, #section, or https://)" value={value.href} onChange={(next) => update(`${path}.href`, next)} /></TwoColumns></fieldset>;
}

export function CardsEditor({ title, items, basePath, update, detailKey = 'description' }) {
  return <fieldset className="rounded-xl border border-[#E1E1E5] p-4"><legend className="px-1 text-xs font-semibold">{title}</legend><div className="grid gap-3 lg:grid-cols-3">{items.map((item, index) => <div className="grid gap-3 rounded-lg bg-[#FAFAFB] p-3" key={index}><Field label={`Item ${index + 1} title`} value={item.title ?? item.label} onChange={(value) => update(`${basePath}.${index}.${item.title === undefined ? 'label' : 'title'}`, value)} /><Field multiline label="Description" value={item[detailKey]} onChange={(value) => update(`${basePath}.${index}.${detailKey}`, value)} /></div>)}</div></fieldset>;
}
