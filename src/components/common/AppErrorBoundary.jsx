import { Component } from 'react';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-lg font-semibold text-red-700">!</div>
          <h1 className="m-0 text-xl font-semibold text-slate-950">The page could not be displayed</h1>
          <p className="mb-5 mt-2 text-sm leading-6 text-slate-600">A frontend component failed to load. Refresh the page to try again.</p>
          <button className="min-h-10 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700" type="button" onClick={() => window.location.reload()}>Refresh page</button>
        </section>
      </main>
    );
  }
}
