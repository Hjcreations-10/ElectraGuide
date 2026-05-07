import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', width, height, circle }) => {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ 
        width: width || '100%', 
        height: height || '20px',
        borderRadius: circle ? '50%' : '12px'
      }} 
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div className="space-y-2">
        <Skeleton width={200} height={32} />
        <Skeleton width={300} height={16} />
      </div>
      <div className="flex gap-3">
        <Skeleton width={120} height={42} />
        <Skeleton width={120} height={42} />
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} height={140} className="rounded-2xl" />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Skeleton height={300} className="rounded-2xl" />
      <Skeleton height={300} className="rounded-2xl" />
    </div>
  </div>
);

export const CandidateSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <Skeleton key={i} height={200} className="rounded-2xl" />
    ))}
  </div>
);

export default Skeleton;
