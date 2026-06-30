import type { ReactNode } from "react";

type TableProps = {
  children: ReactNode;
  className?: string;
};

type TableCellProps = {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
};

function Table({ children, className = "" }: TableProps) {
  return <table className={`min-w-full ${className}`.trim()}>{children}</table>;
}

function TableHeader({ children, className = "" }: TableProps) {
  return <thead className={className}>{children}</thead>;
}

function TableBody({ children, className = "" }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
}

function TableRow({ children, className = "" }: TableProps) {
  return <tr className={className}>{children}</tr>;
}

function TableCell({ children, isHeader = false, className = "", colSpan }: TableCellProps) {
  const CellTag = isHeader ? "th" : "td";

  return <CellTag className={className} colSpan={colSpan}>{children}</CellTag>;
}

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type AdminTableProps<T> = {
  columns: Array<AdminTableColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
};

export function AdminTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage = "No records found.",
}: AdminTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100">
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} isHeader className="py-3 text-start text-sm font-medium text-gray-500">
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
              <TableRow key={getRowKey(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className="py-3 text-sm text-gray-500">{column.render(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="py-6 text-center text-sm text-gray-500" colSpan={columns.length}>{emptyMessage}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export { Table, TableBody, TableCell, TableHeader, TableRow };
