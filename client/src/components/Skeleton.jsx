import React from 'react';

const Skeleton = ({ className, variant = 'rect' }) => {
  const baseClasses = "animate-pulse bg-white/5 rounded-lg";
  
  const variants = {
    rect: "",
    circle: "rounded-full",
    text: "h-4 w-3/4",
    title: "h-8 w-1/2",
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="hero-glass-card p-6 border-white/5">
          <Skeleton className="w-10 h-10 mb-4" variant="circle" />
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-12 h-8" />
        </div>
      ))}
    </div>
    
    <div className="hero-glass-card p-8 border-white/5">
      <Skeleton className="w-48 h-8 mb-8" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="w-12 h-12" variant="circle" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-4">
    <div className="flex justify-between mb-8">
      <Skeleton className="w-64 h-10" />
      <Skeleton className="w-32 h-10" />
    </div>
    <div className="hero-glass-card overflow-hidden border-white/5">
      <div className="p-4 border-b border-white/5 flex space-x-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="flex-1 h-4" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-white/5 flex space-x-4">
          {[1, 2, 3, 4].map(j => <Skeleton key={j} className="flex-1 h-6" />)}
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
