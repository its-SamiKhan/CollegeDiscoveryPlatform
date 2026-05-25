import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  glass = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 transition-all duration-200 overflow-hidden
        ${
          glass
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm"
            : "bg-white dark:bg-slate-900 shadow-sm"
        }
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`p-5 border-b border-slate-100 dark:border-slate-800 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => <div className={`p-5 ${className}`} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 ${className}`} {...props}>
    {children}
  </div>
);
