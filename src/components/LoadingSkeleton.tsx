import { Icons } from './Icons';

export const LoadingSkeleton = () => (
  <div className="animate-fade-in space-y-6">
    <div className="grid gap-4">
      <div className="card-enhanced">
        <div className="flex items-center gap-3 mb-4">
          <Icons.Twitter />
          <div className="loading-shimmer h-6 w-32 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="loading-shimmer h-20 rounded-lg"></div>
          ))}
        </div>
      </div>
      <div className="card-enhanced">
        <div className="flex items-center gap-3 mb-4">
          <Icons.LinkedIn />
          <div className="loading-shimmer h-6 w-32 rounded"></div>
        </div>
        <div className="loading-shimmer h-40 rounded-lg"></div>
      </div>
    </div>
  </div>
);