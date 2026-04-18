export default function LoadingSkeleton({ count = 1, type = 'card' }) {
  const elements = Array.from({ length: count }, (_, i) => i);

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {elements.slice(0, 4).map(i => (
          <div key={i} className="bg-dark-card p-6 rounded-3xl border border-white/5 shadow-2xl flex flex-col items-center animate-pulse-slow">
            <div className="h-4 bg-white/5 rounded w-24 mb-4"></div>
            <div className="h-10 bg-white/10 rounded w-16 mb-2"></div>
            <div className="h-3 bg-white/5 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'tailor') {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-40 bg-dark-card border border-white/5 rounded-3xl mb-12"></div>
        <div className="h-24 bg-brand-500/5 border border-brand-500/20 rounded-3xl mb-12"></div>
        {elements.map(i => (
          <div key={i} className="bg-dark-card border border-white/5 rounded-3xl h-64 shadow-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {elements.map(i => (
        <div key={i} className="bg-dark-card rounded-3xl border border-white/5 p-8 shadow-2xl animate-pulse-slow">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-5">
              <div className="w-14 h-14 bg-white/5 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-5 bg-white/10 rounded-lg w-48"></div>
                <div className="h-4 bg-white/5 rounded-lg w-32"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-3 bg-white/5 rounded w-16"></div>
                  <div className="h-3 bg-white/5 rounded w-20"></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="h-5 bg-white/10 rounded-full w-16"></div>
              <div className="h-10 bg-white/5 rounded-xl w-24"></div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
            <div className="h-3 bg-white/5 rounded w-32"></div>
            <div className="flex gap-3">
              <div className="h-8 bg-white/10 rounded-xl w-24"></div>
              <div className="h-8 bg-white/10 rounded-xl w-28"></div>
              <div className="h-8 bg-white/10 rounded-xl w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
