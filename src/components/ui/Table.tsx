import React from "react";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: string[];
}

export const Table: React.FC<TableProps> = ({
  headers,
  children,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
      <table className={`w-full text-sm text-left border-collapse ${className}`} {...props}>
        <thead className="text-xs uppercase text-slate-500 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 font-bold">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <tr className={`hover:bg-slate-50/40 dark:hover:bg-slate-800/40 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <td className={`px-6 py-4 font-medium text-slate-800 dark:text-slate-200 ${className}`} {...props}>
      {children}
    </td>
  );
};
