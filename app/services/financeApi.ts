import { supabase } from "~/lib/supabase";

export type FinanceImportBatchDto = {
  id: string;
  source: string;
  filename: string | null;
  total_rows: number;
  imported_rows: number;
  duplicate_rows: number;
  skipped_rows: number;
  review_rows: number;
  categorized_rows: number;
  status: string;
  created_at: string;
};

export type FinanceTransactionDto = {
  id: string;
  import_batch_id: string | null;
  source: string;
  external_id: string;
  transaction_type: string;
  booking_date: string | null;
  payment_date: string | null;
  description: string;
  gross_amount: number | string;
  fee: number | string;
  currency: string;
  balance_after: number | string | null;
  raw_type: string | null;
  raw_product: string | null;
  raw_state: string | null;
  category: string | null;
  bas_account: string | null;
  vat_rate: number | string | null;
  vat_amount: number | string | null;
  receipt_status: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type FinanceImportResultDto = {
  ok: true;
  batchId: string;
  totalRows: number;
  importedRows: number;
  duplicateRows: number;
  skippedRows: number;
  reviewRows: number;
  categorizedRows: number;
};

type ApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  status?: number;
};

const apiUrl = import.meta.env.VITE_KWSTUDIO_API_URL;

export const isFinanceApiConfigured = Boolean(apiUrl);

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ? `Bearer ${session.access_token}` : null;
}

async function requestFinanceApi<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  if (!apiUrl) {
    return { ok: false, error: "API not configured. Set VITE_KWSTUDIO_API_URL." };
  }

  const authorization = await authHeader();
  if (!authorization) {
    return { ok: false, error: "Authentication required. Sign in before calling the KWStudio API." };
  }

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        Authorization: authorization,
        ...(init.headers ?? {}),
      },
    });
    const data = await response.json().catch(() => null) as T | { error?: string; message?: string } | null;

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data && typeof data === "object" && ("message" in data || "error" in data)
          ? data.message ?? data.error
          : `Finance API request failed with ${response.status}.`,
      };
    }

    return { ok: true, data: data as T, status: response.status };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Finance API request failed.",
    };
  }
}

export function importRevolutCsv(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return requestFinanceApi<FinanceImportResultDto>("/finance/imports/revolut-csv", {
    method: "POST",
    body: formData,
  });
}

export function getFinanceImports() {
  return requestFinanceApi<{ ok: true; imports: FinanceImportBatchDto[] }>("/finance/imports");
}

export function getFinanceTransactions(params: { status?: string; receipt_status?: string; limit?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set("status", params.status);
  if (params.receipt_status) searchParams.set("receipt_status", params.receipt_status);
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();

  return requestFinanceApi<{ ok: true; transactions: FinanceTransactionDto[] }>(
    `/finance/transactions${query ? `?${query}` : ""}`,
  );
}
