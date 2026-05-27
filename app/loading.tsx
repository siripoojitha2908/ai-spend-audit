export default function Loading() {
  return (
    <div className="container py-24 text-center">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-brand-500/30 text-brand-200">
        <span className="animate-spin">⏳</span>
      </div>
      <p className="mt-6 text-sm text-slate-300">Analyzing your audit and preparing your savings report...</p>
    </div>
  );
}
