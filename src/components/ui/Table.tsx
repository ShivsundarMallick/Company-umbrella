import { cn } from '../../utils/cn';
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

interface TableSectionProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200" {...props}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }: TableSectionProps) {
  return <thead className={cn('bg-gray-50', className)} {...props}>{children}</thead>;
}

export function TableBody({ children, className, ...props }: TableSectionProps) {
  return <tbody className={cn('divide-y divide-gray-200 bg-white', className)} {...props}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return <tr className={cn('hover:bg-gray-50 transition-colors', className)} {...props}>{children}</tr>;
}

export function TableHead({ children, className, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)} {...props}>
      {children}
    </td>
  );
}
