import type { ReactNode } from "react";

type TableProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
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

function TableRow({ children, className = "", onClick }: TableProps) {
  return <tr className={className} onClick={onClick}>{children}</tr>;
}

function TableCell({ children, isHeader = false, className = "", colSpan }: TableCellProps) {
  const CellTag = isHeader ? "th" : "td";

  return <CellTag className={className} colSpan={colSpan}>{children}</CellTag>;
}

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Optional text alignment applied to both header and data cells. Defaults to "left". */
  align?: "left" | "right" | "center";
};

type AdminTableProps<T> = {
  columns: Array<AdminTableColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  /** Called when the user clicks anywhere on a data row. */
  onRowClick?: (row: T) => void;
  /** When provided, rows returning true receive a selected highlight style. */
  isSelected?: (row: T) => boolean;
};

const ALIGN_CLASS: Record<NonNullable<AdminTableColumn<unknown>["align"]>, string> = {
  left:   "text-left",
  right:  "text-right",
  center: "text-center",
};

export function AdminTable<T>({
  columns,
  rows,
  getRowKey,
  emptyMessage = "No records found.",
  onRowClick,
  isSelected,
}: AdminTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100">
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  isHeader
                  className={`py-3 pr-4 text-sm font-medium text-gray-500 ${ALIGN_CLASS[column.align ?? "left"]}`}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => {
                const selected = isSelected?.(row) ?? false;
                const clickable = Boolean(onRowClick);
                return (
                  <TableRow
                    key={getRowKey(row)}
                    className={[
                      selected ? "bg-blue-50" : "hover:bg-gray-50",
                      clickable ? "cursor-pointer" : "",
                    ].join(" ").trim()}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={`py-3 pr-4 text-sm text-gray-500 ${ALIGN_CLASS[column.align ?? "left"]}`}
                      >
                        {column.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
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
