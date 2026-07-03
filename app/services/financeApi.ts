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

export type FinanceReceiptTransactionSummaryDto = {
  id: string;
  description: string;
  booking_date: string | null;
  payment_date: string | null;
  gross_amount: number | string;
  currency: string;
  receipt_status: string;
  transaction_type: string;
};

export type FinanceReceiptCandidateDto = {
  id?: string;
  receipt_id?: string;
  transaction_id?: string;
  score: number;
  reason: string | null;
  amount_match: boolean;
  date_match: boolean;
  supplier_match: boolean;
  currency_match: boolean;
  transaction: FinanceReceiptTransactionSummaryDto;
};

export type FinanceReceiptDto = {
  id: string;
  transaction_id: string | null;
  filename: string;
  original_filename: string | null;
  file_path: string | null;
  mime_type: string | null;
  file_size: number | null;
  supplier: string | null;
  receipt_date: string | null;
  total_amount: number | string | null;
  vat_amount: number | string | null;
  currency: string | null;
  extracted_text: string | null;
  extraction_status: string;
  match_status: string;
  best_transaction_id: string | null;
  best_match_score: number | null;
  match_reason: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  confirmed_transaction?: FinanceReceiptTransactionSummaryDto | null;
  best_transaction?: FinanceReceiptTransactionSummaryDto | null;
  candidates?: FinanceReceiptCandidateDto[];
};

export type FinanceReceiptUploadFields = {
  supplier?: string;
  receiptDate?: string;
  totalAmount?: string;
  vatAmount?: string;
  currency?: string;
};

export type SieExportRequest = {
  from: string;
  to: string;
  includeOpeningBalances: boolean;
  includeClosingBalances: boolean;
};

export type SieExportValidation = {
  ok: boolean;
  checks: {
    trialBalanceBalanced: boolean;
    journalEntriesPosted: boolean;
    accountsValid: boolean;
    verificationsBalanced: boolean;
  };
  errors: string[];
  warnings: string[];
};

export type SieExportMetadata = {
  type: "SIE4";
  encoding: "UTF-8";
  lineEndings: "CRLF";
  created: string;
  period: { from: string; to: string };
  filename: string;
  verifications: number;
  accounts: number;
  verificationSeries: string[];
  includeOpeningBalances: boolean;
  includeClosingBalances: boolean;
  validation: SieExportValidation;
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
      const backendError = data && typeof data === "object" ? JSON.stringify(data, null, 2) : null;

      return {
        ok: false,
        status: response.status,
        error: backendError ?? `Finance API request failed with ${response.status}.`,
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

async function requestFinanceFile(path: string, init: RequestInit = {}): Promise<ApiResult<{ blob: Blob; metadata: SieExportMetadata }>> {
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

    if (!response.ok) {
      const data = await response.json().catch(() => null) as { error?: string; message?: string; validation?: SieExportValidation } | null;
      const backendError = data ? JSON.stringify(data, null, 2) : null;

      return {
        ok: false,
        status: response.status,
        error: backendError ?? `Finance API request failed with ${response.status}.`,
        data: data?.validation ? { blob: new Blob(), metadata: validationMetadataFallback(data.validation) } : undefined,
      };
    }

    const encodedMetadata = response.headers.get("X-SIE-Metadata");
    const metadata = encodedMetadata
      ? JSON.parse(decodeURIComponent(encodedMetadata)) as SieExportMetadata
      : validationMetadataFallback({
        ok: true,
        checks: {
          trialBalanceBalanced: true,
          journalEntriesPosted: true,
          accountsValid: true,
          verificationsBalanced: true,
        },
        errors: [],
        warnings: [],
      });

    return {
      ok: true,
      status: response.status,
      data: {
        blob: await response.blob(),
        metadata,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Finance API request failed.",
    };
  }
}

function validationMetadataFallback(validation: SieExportValidation): SieExportMetadata {
  const now = new Date().toISOString();
  return {
    type: "SIE4",
    encoding: "UTF-8",
    lineEndings: "CRLF",
    created: now,
    period: { from: "", to: "" },
    filename: "KWStudio.se",
    verifications: 0,
    accounts: 0,
    verificationSeries: [],
    includeOpeningBalances: false,
    includeClosingBalances: false,
    validation,
  };
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

export function uploadFinanceReceipt(file: File, fields: FinanceReceiptUploadFields = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (fields.supplier) formData.append("supplier", fields.supplier);
  if (fields.receiptDate) formData.append("receiptDate", fields.receiptDate);
  if (fields.totalAmount) formData.append("totalAmount", fields.totalAmount);
  if (fields.vatAmount) formData.append("vatAmount", fields.vatAmount);
  if (fields.currency) formData.append("currency", fields.currency);

  return requestFinanceApi<{
    ok: true;
    receipt: FinanceReceiptDto;
    candidates: FinanceReceiptCandidateDto[];
    extraction: {
      supplier: string | null;
      receiptDate: string | null;
      totalAmount: number | null;
      vatAmount: number | null;
      currency: string;
    };
    bestMatch: FinanceReceiptCandidateDto | null;
  }>("/finance/receipts/upload", {
    method: "POST",
    body: formData,
  });
}

export function getFinanceReceipts(params: { match_status?: string; limit?: number; includeCandidates?: boolean } = {}) {
  const searchParams = new URLSearchParams();
  if (params.match_status) searchParams.set("match_status", params.match_status);
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.includeCandidates) searchParams.set("includeCandidates", "true");
  const query = searchParams.toString();

  return requestFinanceApi<{ ok: true; receipts: FinanceReceiptDto[] }>(
    `/finance/receipts${query ? `?${query}` : ""}`,
  );
}

export function getFinanceReceipt(id: string) {
  return requestFinanceApi<{ ok: true; receipt: FinanceReceiptDto }>(`/finance/receipts/${id}`);
}

export function matchFinanceReceipt(receiptId: string, transactionId: string) {
  return requestFinanceApi<{ ok: true; receipt: FinanceReceiptDto; transaction: FinanceReceiptTransactionSummaryDto }>(
    `/finance/receipts/${receiptId}/match`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId }),
    },
  );
}

export function unmatchFinanceReceipt(receiptId: string) {
  return requestFinanceApi<{ ok: true; receipt: FinanceReceiptDto }>(`/finance/receipts/${receiptId}/unmatch`, {
    method: "POST",
  });
}

export function recalculateReceiptMatches(receiptId: string) {
  return requestFinanceApi<{ ok: true; receipt: FinanceReceiptDto; candidates: FinanceReceiptCandidateDto[] }>(
    `/finance/receipts/${receiptId}/recalculate-matches`,
    { method: "POST" },
  );
}

export function generateSieExport(payload: SieExportRequest) {
  return requestFinanceFile("/finance/sie/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
