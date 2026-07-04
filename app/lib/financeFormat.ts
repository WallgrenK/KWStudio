/** Shared Swedish finance formatting for the admin Finance module. */

export function toFinanceNumber(value: number | string | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Swedish SEK with 2 decimal places and kr suffix. */
export function formatKr(value: number | string | null | undefined): string {
  const amount = toFinanceNumber(value);
  return `${amount.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;
}

/** Decimal rate (0–1) as Swedish percent string. */
export function formatPercent(rate: number): string {
  return `${(rate * 100).toLocaleString("sv-SE", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function formatKrDelta(value: number): string {
  if (!Number.isFinite(value) || value === 0) return formatKr(0);
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatKr(value)}`;
}

export function formatPercentDelta(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0,0 %";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatPercent(value)}`;
}

/** Signed amount with currency code (transactions). */
export function formatFinanceAmount(amount: number, currency = "SEK"): string {
  const formatted = Math.abs(amount).toLocaleString("sv-SE", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });

  return `${amount < 0 ? "-" : "+"}${formatted} ${currency}`;
}

/** Unsigned amount with currency code; dash when zero. */
export function formatReceiptAmount(value: number | string | null | undefined, currency = "SEK"): string {
  const amount = toFinanceNumber(value);
  if (!amount) return "—";
  return `${amount.toLocaleString("sv-SE", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })} ${currency}`;
}

/** ISO date → Swedish locale date. */
export function formatFinanceDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("sv-SE");
}

/** Map transaction receipt status to StatusBadge registry key. */
export function receiptStatusBadgeKey(status: string): string {
  if (status === "missing") return "missing_receipt";
  return status;
}

export { toFinanceNumber as toNumber };
