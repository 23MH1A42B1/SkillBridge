export default function LoadingSkeleton({ count = 1, type = 'card' }) {
  const elements = Array.from({ length: count }, (_, i) => i);

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {elements.slice(0, 4).map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center animate-pulse-slow">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {elements.map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-pulse-slow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-100 rounded w-32"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-3 bg-gray-100 rounded w-16"></div>
                  <div className="h-3 bg-gray-100 rounded w-20"></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="h-5 bg-gray-200 rounded-full w-16"></div>
              <div className="h-8 bg-gray-200 rounded-lg w-20 mt-1"></div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-32"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
