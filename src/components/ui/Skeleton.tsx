import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  width,
  height,
  className = "",
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded-lg";
      case "text":
      default:
        return "rounded h-4 w-full";
    }
  };

  const customStyle: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${getVariantStyles()} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};

export const CollegeCardSkeleton: React.FC = () => {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
      <Skeleton variant="rectangular" height={192} />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton variant="rectangular" width={80} height={20} />
          <Skeleton variant="rectangular" width={50} height={20} />
        </div>
        <Skeleton variant="text" width="85%" height={24} />
        <Skeleton variant="text" width="50%" />
        <hr className="border-slate-100 dark:border-slate-800" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton variant="text" width={60} height={12} />
            <Skeleton variant="text" width={90} height={16} />
          </div>
          <div className="space-y-1">
            <Skeleton variant="text" width={60} height={12} />
            <Skeleton variant="text" width={90} height={16} />
          </div>
        </div>
        <hr className="border-slate-100 dark:border-slate-800" />
        <div className="flex justify-between gap-3 pt-1">
          <Skeleton variant="rectangular" className="flex-1" height={36} />
          <Skeleton variant="rectangular" className="w-10" height={36} />
        </div>
      </div>
    </div>
  );
};
