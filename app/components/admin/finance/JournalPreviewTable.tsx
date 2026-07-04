import { formatKr } from "~/lib/financeFormat";

export type JournalPreviewLine = {
  key: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
};

type JournalPreviewTableProps = {
  title?: string;
  lines: JournalPreviewLine[];
  accountLabel: (account: string) => string;
};

export function JournalPreviewTable({
  title = "Recognition Journal",
  lines,
  accountLabel,
}: JournalPreviewTableProps) {
  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-base font-semibold text-gray-900">{title}</h4>
        <span className={`text-xs font-medium ${balanced ? "text-emerald-600" : "text-red-500"}`}>
          {balanced ? "✓ Balanced" : "⚠ Unbalanced"}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-medium text-gray-500">
            <th className="pb-2 text-left" scope="col">Account</th>
            <th className="pb-2 text-left" scope="col">Description</th>
            <th className="pb-2 text-right" scope="col">Debit</th>
            <th className="pb-2 text-right" scope="col">Credit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {lines.map((line) => (
            <tr key={line.key} className="text-gray-700">
              <td className="py-2 pr-3 font-mono text-xs">{accountLabel(line.account)}</td>
              <td className="py-2 pr-3 text-gray-500">{line.description}</td>
              <td className="py-2 text-right tabular-nums">{line.debit > 0 ? formatKr(line.debit) : ""}</td>
              <td className="py-2 text-right tabular-nums">{line.credit > 0 ? formatKr(line.credit) : ""}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 text-xs font-semibold text-gray-700">
            <td className="pt-2" colSpan={2}>Total</td>
            <td className="pt-2 text-right tabular-nums">{formatKr(totalDebit)}</td>
            <td className="pt-2 text-right tabular-nums">{formatKr(totalCredit)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
