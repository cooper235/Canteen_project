export function DishCardSkeleton() {
  return (
    <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-slate-700/50"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
        <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-6 bg-slate-700/50 rounded w-16"></div>
          <div className="h-9 bg-slate-700/50 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function CanteenCardSkeleton() {
  return (
    <div className="bg-white/[0.08] backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 animate-pulse h-full flex flex-col">
      {/* Image skeleton */}
      <div className="h-56 bg-slate-700/50"></div>
      
      {/* Content skeleton */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="h-6 bg-slate-700/50 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-slate-700/50 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
        </div>
        <div className="mt-auto pt-3 border-t border-white/5">
          <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl p-8 border border-white/10 animate-pulse">
      <div className="w-16 h-16 bg-slate-700/50 rounded-xl mx-auto mb-4"></div>
      <div className="h-12 bg-slate-700/50 rounded w-24 mx-auto mb-2"></div>
      <div className="h-4 bg-slate-700/50 rounded w-32 mx-auto"></div>
    </div>
  );
}

export function RecommendationCardSkeleton() {
  return (
    <div className="bg-white/[0.08] backdrop-blur-sm rounded-2xl p-6 border border-white/10 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 bg-slate-700/50 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700/50 rounded w-full"></div>
          <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
          <div className="flex items-center justify-between mt-4">
            <div className="h-6 bg-slate-700/50 rounded w-16"></div>
            <div className="h-8 bg-slate-700/50 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
