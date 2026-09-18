export function DatasetProfile({ profile, loading, profiling, onProfile }) {
  if (loading) return <section className="rounded-xl border border-[#E5E5E8] bg-white p-7"><p className="m-0 text-sm text-[#6E6E73]">Loading dataset profile…</p></section>;
  if (!profile || profile.profile_status !== 'completed') {
    const failed = profile?.profile_status === 'failed';
    return (
      <section className="grid items-center gap-5 rounded-xl border border-[#E5E5E8] bg-white p-7 sm:grid-cols-[1fr_auto]">
        <div><p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">{failed ? 'Profiling failed' : 'Not profiled'}</p><h2 className="mb-2 text-xl font-semibold tracking-tight text-slate-900">{failed ? 'The last profiling attempt failed.' : 'Profile this dataset before analysis.'}</h2><p className="m-0 text-sm leading-6 text-slate-500">Inspect its structure and data-quality signals before creating queries.</p></div>
        <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50" type="button" onClick={onProfile} disabled={profiling}>{profiling ? 'Profiling dataset…' : 'Profile dataset'}</button>
      </section>
    );
  }

  const columns = profile.schema?.columns ?? [];
  const missing = profile.missing_values?.total_missing_cells ?? 0;
  const duplicates = profile.duplicate_summary?.duplicate_rows ?? 0;
  const issues = profile.quality_issues ?? [];
  return (
    <section className="rounded-xl border border-[#E5E5E8] bg-white p-5 sm:p-7">
      <div className="flex flex-col items-start justify-between gap-3 min-[400px]:flex-row"><div><p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Profile complete</p><h2 className="m-0 text-xl font-semibold tracking-tight text-slate-900">Dataset profile</h2></div><button className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50" type="button" onClick={onProfile} disabled={profiling}>{profiling ? 'Profiling…' : 'Refresh profile'}</button></div>
      <dl className="my-6 grid grid-cols-2 border-y border-slate-200 sm:grid-cols-4">{[['Rows', profile.row_count?.toLocaleString()], ['Columns', profile.column_count], ['Missing cells', missing.toLocaleString()], ['Duplicate rows', duplicates.toLocaleString()]].map(([label, value], index) => <div className={`p-4 ${index % 2 === 0 ? 'pl-0' : ''} ${index < 3 ? 'sm:border-r sm:border-slate-200' : ''}`} key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mb-0 mt-1.5 text-xl font-semibold text-slate-900">{value}</dd></div>)}</dl>
      <div><h3 className="mb-3 text-sm font-semibold text-slate-900">Data quality</h3>{issues.length ? <ul className="m-0 grid gap-2 pl-5 text-sm leading-6 text-slate-600">{issues.map((issue, index) => <li key={`${issue.code}-${issue.column ?? index}`}>{issue.message}</li>)}</ul> : <p className="m-0 text-sm text-slate-500">No major data-quality issues detected.</p>}</div>
      {columns.length > 0 && <details className="mt-6 border-t border-slate-200 pt-5"><summary className="cursor-pointer text-sm font-semibold text-slate-700">Column details ({columns.length})</summary><div className="mt-3 grid" role="table" aria-label="Dataset columns">{columns.map((column) => <div className="grid gap-1 border-t border-slate-100 px-1 py-2.5 text-xs sm:grid-cols-[1fr_140px_110px] sm:gap-3" role="row" key={column.name}><strong className="text-slate-800" role="cell">{column.name}</strong><span className="text-slate-500" role="cell">{column.inferred_type}</span><span className="text-slate-500" role="cell">{column.null_count} missing</span></div>)}</div></details>}
    </section>
  );
}
