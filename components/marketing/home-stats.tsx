export function HomeStats() {
  return (
    <div className="grid gap-6">
      <div className="card-glass p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">82% of startups</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Find hidden AI waste in minutes.</h2>
        <p className="mt-4 text-slate-300">Audit plan fit, seat utilization, and vendor overlap with a modern conversion experience built for founders and engineering managers.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <p className="text-sm text-slate-400">AI tools supported</p>
          <p className="mt-3 text-3xl font-semibold text-white">8+</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <p className="text-sm text-slate-400">Expected lead capture lift</p>
          <p className="mt-3 text-3xl font-semibold text-white">+23%</p>
        </div>
      </div>
    </div>
  );
}
