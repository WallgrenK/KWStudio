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

export type OwnerExpenseStatus = "draft" | "posted" | "partially_reimbursed" | "reimbursed" | "cancelled";
export type OwnerExpensePaymentSource = "owner_private" | "company_bank";

export type OwnerExpenseReimbursementDto = {
  id: string;
  owner_expense_id: string;
  linked_bank_transaction_id: string | null;
  amount: number | string;
  reimbursed_at: string;
  journal_entry_id: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

export type OwnerExpenseDto = {
  id: string;
  status: OwnerExpenseStatus;
  payment_source: OwnerExpensePaymentSource;
  linked_bank_transaction_id: string | null;
  expense_date: string;
  description: string;
  supplier_id: string | null;
  supplier_name: string | null;
  receipt_id: string | null;
  currency: string;
  gross_amount: number | string;
  net_amount: number | string;
  vat_amount: number | string;
  vat_rate: number | string | null;
  vat_treatment: string | null;
  is_vat_deductible: boolean;
  reverse_charge: boolean;
  expense_account: string;
  recognition_owner_account: string;
  reimbursement_owner_account: string;
  recognition_journal_entry_id: string | null;
  notes: string | null;
  total_reimbursed_amount: number | string;
  outstanding_amount: number | string;
  posted_at: string | null;
  created_by: string | null;
  posted_by: string | null;
  created_at: string;
  updated_at: string;
  reimbursements?: OwnerExpenseReimbursementDto[];
  receipt?: FinanceReceiptDto | null;
  supplier?: {
    id: string;
    name: string;
    normalized_name: string;
  } | null;
  linked_bank_transaction?: FinanceTransactionDto | null;
  recognition_entry?: {
    id: string;
    verification_number: string | null;
    entry_date: string | null;
    description: string | null;
    status: string;
  } | null;
  recognition_lines?: Array<{
    id: string;
    account: string;
    debit: number | string | null;
    credit: number | string | null;
    description: string | null;
  }>;
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

export type VatPeriodStatus = "open" | "locked" | "submitted" | "closed";

export type VatPeriodHistoryEventDto = {
  at: string;
  action: "created" | "locked" | "unlocked" | "submitted" | "closed";
  from_status: VatPeriodStatus | null;
  to_status: VatPeriodStatus;
  actor: string | null;
  reason?: string;
  calculation_hash?: string | null;
};

export type VatPeriodDto = {
  id: string;
  period_start: string;
  period_end: string;
  period_type: "monthly" | "quarterly" | "yearly";
  status: VatPeriodStatus;
  created_at: string;
  updated_at: string;
  locked_at?: string | null;
  locked_by?: string | null;
  unlocked_at?: string | null;
  unlocked_by?: string | null;
  unlock_reason?: string | null;
  submitted_at?: string | null;
  submitted_by?: string | null;
  submission_metadata?: Record<string, unknown> | null;
  closed_at?: string | null;
  closed_by?: string | null;
  calculation_hash?: string | null;
  history?: VatPeriodHistoryEventDto[];
};

export type VatBreakdownByAccountDto = {
  account: string;
  account_name: string | null;
  output_vat: number;
  input_vat: number;
  deductible_vat: number;
  non_deductible_vat: number;
  references: Array<{
    journal_entry_id: string;
    journal_line_id: string;
    verification_number: string | null;
    account: string;
    account_name: string | null;
    posting_date: string | null;
    journal_description: string | null;
    line_description: string | null;
  }>;
};

export type VatBreakdownByJournalDto = {
  journal_entry_id: string;
  verification_number: string | null;
  posting_date: string | null;
  description: string | null;
  output_vat: number;
  input_vat: number;
  deductible_vat: number;
  non_deductible_vat: number;
  references: VatBreakdownByAccountDto["references"];
};

export type VatDeclarationBoxesDto = {
  box_05: number;
  box_06: number;
  box_07: number;
  box_08: number;
  box_10: number;
  box_11: number;
  box_12: number;
  box_48: number;
  box_49: number;
};

export type VatDeclarationSummaryDto = {
  output_vat: number;
  input_vat: number;
  deductible_vat: number;
  non_deductible_vat: number;
  vat_payable: number;
  vat_refundable: number;
};

export type VatReportDto = {
  period: VatPeriodDto;
  calculation_mode: "live" | "snapshot";
  summary: VatDeclarationSummaryDto & {
    journal_entries: number;
    boxes: VatDeclarationBoxesDto;
  };
  breakdownByAccount: VatBreakdownByAccountDto[];
  breakdownByJournal: VatBreakdownByJournalDto[];
  entries?: Array<{
    id: string;
    verification_number: string | null;
    entry_date: string | null;
    description: string | null;
  }>;
};

export type VatDeclarationDto = {
  period: VatPeriodDto;
  calculation_mode: "live" | "snapshot";
  declaration: {
    generated_at: string;
    source: "posted_journals";
    boxes: VatDeclarationBoxesDto;
    summary: VatDeclarationSummaryDto;
  };
};

export type VatPeriodCalculatedDto = {
  period: VatPeriodDto;
  calculation_mode: "live" | "snapshot";
  summary?: VatReportDto["summary"];
  entries?: VatReportDto["entries"];
  breakdownByAccount?: VatBreakdownByAccountDto[];
  breakdownByJournal?: VatBreakdownByJournalDto[];
  declaration_snapshot?: unknown;
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

export function getOwnerExpenses(params: { status?: string; payment_source?: string; limit?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set("status", params.status);
  if (params.payment_source) searchParams.set("payment_source", params.payment_source);
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();

  return requestFinanceApi<{ ok: true; ownerExpenses: OwnerExpenseDto[] }>(
    `/finance/owner-expenses${query ? `?${query}` : ""}`,
  );
}

export function createOwnerExpense(payload: Partial<OwnerExpenseDto> & { description: string; gross_amount: number | string; expense_account: string }) {
  return requestFinanceApi<{ ok: true; ownerExpense: OwnerExpenseDto }>("/finance/owner-expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getOwnerExpense(id: string) {
  return requestFinanceApi<{ ok: true; ownerExpense: OwnerExpenseDto }>(`/finance/owner-expenses/${id}`);
}

export function updateOwnerExpense(id: string, payload: Partial<OwnerExpenseDto>) {
  return requestFinanceApi<{ ok: true; ownerExpense: OwnerExpenseDto }>(`/finance/owner-expenses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function postOwnerExpense(id: string, payload: { posted_by?: string } = {}) {
  return requestFinanceApi<{ ok: true; ownerExpense: OwnerExpenseDto }>(`/finance/owner-expenses/${id}/post`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function reimburseOwnerExpense(
  id: string,
  payload: { amount: number | string; reimbursed_at?: string; linked_bank_transaction_id?: string; notes?: string; created_by?: string },
) {
  return requestFinanceApi<{ ok: true; ownerExpense: OwnerExpenseDto }>(`/finance/owner-expenses/${id}/reimburse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
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

export type FinanceAccountCatalogDto = {
  account: string;
  name: string;
  account_type: string;
  category: string | null;
  is_active: boolean | null;
};

export type FinanceSupplierDto = {
  id: string;
  name: string;
  normalized_name: string;
  default_category: string | null;
  default_bas_account: string | null;
  default_vat_rate: number | string | null;
  vat_treatment: string | null;
  reverse_charge: boolean;
  is_active: boolean;
  confirmed_matches: number;
};

export function getFinanceAccountsCatalog() {
  return requestFinanceApi<{ ok: true; accounts: FinanceAccountCatalogDto[] }>("/finance/accounts/catalog");
}

export function createFinanceSupplier(payload: {
  name: string;
  default_bas_account?: string | null;
  default_vat_rate?: number | null;
  vat_treatment?: string | null;
}) {
  return requestFinanceApi<{ ok: true; supplier: FinanceSupplierDto }>("/finance/suppliers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getFinanceSuppliers(params: { active?: boolean } = {}) {
  const searchParams = new URLSearchParams();
  if (params.active !== undefined) searchParams.set("active", String(params.active));
  const query = searchParams.toString();
  return requestFinanceApi<{ ok: true; suppliers: FinanceSupplierDto[] }>(
    `/finance/suppliers${query ? `?${query}` : ""}`,
  );
}

export function updateFinanceSupplier(
  id: string,
  payload: {
    name?: string;
    default_category?: string | null;
    default_bas_account?: string | null;
    default_vat_rate?: number | null;
    vat_treatment?: string | null;
    reverse_charge?: boolean;
    is_active?: boolean;
  },
) {
  return requestFinanceApi<{ ok: true; supplier: FinanceSupplierDto }>(`/finance/suppliers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function generateSieExport(payload: SieExportRequest) {
  return requestFinanceFile("/finance/sie/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getVatPeriods(params: { frequency?: "monthly" | "quarterly" | "yearly"; year?: number; status?: VatPeriodStatus; limit?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.frequency) searchParams.set("frequency", params.frequency);
  if (params.year) searchParams.set("year", String(params.year));
  if (params.status) searchParams.set("status", params.status);
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return requestFinanceApi<{ ok: true; periods: VatPeriodCalculatedDto[] }>(`/finance/vat/periods${query ? `?${query}` : ""}`);
}

export function ensureVatPeriod(payload: { periodType: "monthly" | "quarterly" | "yearly"; periodStart: string; periodEnd: string }) {
  return requestFinanceApi<{ ok: true; period: VatPeriodDto }>("/finance/vat/periods/ensure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function calculateVatPeriod(id: string) {
  return requestFinanceApi<{ ok: true } & VatPeriodCalculatedDto>(`/finance/vat/periods/${id}/calculate`, {
    method: "POST",
  });
}

export function getVatPeriodReport(id: string) {
  return requestFinanceApi<{ ok: true; report: VatReportDto }>(`/finance/vat/periods/${id}/report`);
}

export function getVatPeriodDeclaration(id: string) {
  return requestFinanceApi<{ ok: true } & VatDeclarationDto>(`/finance/vat/periods/${id}/declaration`);
}

export function lockVatPeriod(id: string) {
  return requestFinanceApi<{ ok: true } & VatPeriodCalculatedDto>(`/finance/vat/periods/${id}/lock`, {
    method: "POST",
  });
}

export function unlockVatPeriod(id: string, reason: string) {
  return requestFinanceApi<{ ok: true } & VatPeriodCalculatedDto>(`/finance/vat/periods/${id}/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
}

export function submitVatPeriod(id: string, metadata?: Record<string, unknown>) {
  return requestFinanceApi<{ ok: true } & VatPeriodCalculatedDto>(`/finance/vat/periods/${id}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata ? { metadata } : {}),
  });
}

export function closeVatPeriod(id: string) {
  return requestFinanceApi<{ ok: true } & VatPeriodCalculatedDto>(`/finance/vat/periods/${id}/close`, {
    method: "POST",
  });
}

export function getVatPeriodHistory(id: string) {
  return requestFinanceApi<{
    ok: true;
    period: VatPeriodDto;
    history: VatPeriodHistoryEventDto[];
    history_supported: true;
  }>(`/finance/vat/periods/${id}/history`);
}
