import {
  AlertTriangle,
  Archive,
  Banknote,
  Building2,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  FileArchive,
  FileCheck2,
  FileText,
  Landmark,
  ReceiptText,
  Settings,
  Upload,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FinanceStatus =
  | "Draft"
  | "Pending"
  | "Paid"
  | "Overdue"
  | "Review"
  | "Ready"
  | "Posted"
  | "Missing receipt"
  | "Matched"
  | "Done"
  | "Active"
  | "Scheduled";

export type FinanceMetric = {
  label: string;
  value: string;
  detail: string;
  targetTab?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
};

export type FinanceTransaction = {
  id: string;
  source: "revolut_csv" | "manual";
  externalId: string;
  transactionType: "income" | "expense" | "transfer" | "unknown";
  bookingDate: string;
  paymentDate: string;
  description: string;
  grossAmount: number;
  fee: number;
  currency: "SEK" | "EUR" | "USD";
  category: string;
  basAccount: string;
  vatRate: number;
  vatAmount: number;
  receiptStatus: "matched" | "missing" | "needs_review" | "not_required";
  invoiceStatus?: "matched" | "unmatched";
  aiConfidence: number;
  status: "review" | "ready" | "posted";
};

export type FinanceInvoice = {
  id: string;
  client: string;
  project: string;
  amount: string;
  vat: string;
  dueDate: string;
  status: "Pending" | "Paid" | "Overdue" | "Draft";
  matchedPayment: string;
};

export type FinanceExpense = {
  id: string;
  supplier: string;
  date: string;
  amount: string;
  category: string;
  basAccount: string;
  vat: string;
  receipt: string;
  status: FinanceStatus;
};

export type FinanceReceipt = {
  id: string;
  filename: string;
  supplier: string;
  date: string;
  amount: string;
  vat: string;
  matchedTransaction: string;
  status: FinanceStatus;
};

export type JournalEntry = {
  id: string;
  verificationNo: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: string;
  status: FinanceStatus;
};

export type FinanceAsset = {
  id: string;
  asset: string;
  purchaseDate: string;
  purchaseAmount: string;
  category: string;
  depreciationPeriod: string;
  thisYearDepreciation: string;
  bookValue: string;
  status: FinanceStatus;
};

export type FinanceReport = {
  id: string;
  title: string;
  description: string;
  status: FinanceStatus;
  action: "Generate" | "Download demo";
  icon: LucideIcon;
};

export const financeTabs = [
  { id: "overview", label: "Overview" },
  { id: "import", label: "Import" },
  { id: "transactions", label: "Transactions" },
  { id: "invoices", label: "Invoices" },
  { id: "expenses", label: "Expenses" },
  { id: "owner-expenses", label: "Owner Expenses" },
  { id: "receipts", label: "Receipts" },
  { id: "bookkeeping", label: "Bookkeeping" },
  { id: "vat", label: "VAT" },
  { id: "taxes", label: "Taxes" },
  { id: "assets", label: "Assets" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
] as const;

export type FinanceTabId = (typeof financeTabs)[number]["id"];

export const financeOverview: FinanceMetric[] = [
  { label: "Revenue this month", value: "64,000 SEK", detail: "Two payments received", targetTab: "transactions", trend: "up", icon: Banknote },
  { label: "Bank balance", value: "51,240 SEK", detail: "Revolut Pro closing balance", targetTab: "transactions", trend: "neutral", icon: Landmark },
  { label: "VAT to pay", value: "12,840 SEK", detail: "Draft estimate for current period", targetTab: "vat", trend: "down", icon: ReceiptText },
  { label: "Estimated tax", value: "18,400 SEK", detail: "Based on demo reserve rules", targetTab: "taxes", trend: "neutral", icon: Calculator },
  { label: "Profit this month", value: "38,200 SEK", detail: "Revenue less categorized costs", targetTab: "reports", trend: "up", icon: CircleDollarSign },
];

export const financeActions = [
  { id: "act-001", title: "3 transactions need review", detail: "Categorization and account suggestions are ready to approve.", status: "Review" as const, actionLabel: "Review transactions", targetTab: "transactions" },
  { id: "act-002", title: "2 receipts missing", detail: "OpenAI and Figma need receipt files before period close.", status: "Missing receipt" as const, actionLabel: "Upload receipts", targetTab: "receipts" },
  { id: "act-003", title: "VAT report draft ready", detail: "Review boxes 05, 10, 48 and 49.", status: "Ready" as const, actionLabel: "Open VAT tab", targetTab: "vat" },
  { id: "act-004", title: "1 overdue invoice", detail: "Maison Vala is past due.", status: "Overdue" as const, actionLabel: "View invoice", targetTab: "invoices" },
  { id: "act-005", title: "Tax pocket is 5,560 SEK below target", detail: "Reserve gap should be reviewed before the next transfer.", status: "Pending" as const, actionLabel: "Open taxes", targetTab: "taxes" },
];

export const importStatus = [
  { label: "Last Revolut CSV import", value: "Jul 01, 2026", detail: "Manual monthly upload" },
  { label: "Rows imported", value: "42", detail: "Rows accepted from CSV" },
  { label: "Categorized", value: "39", detail: "Matched by backend-ready rules" },
  { label: "Need review", value: "3", detail: "Awaiting approval" },
];

export const cashFlow = [
  { label: "Money in", value: "64,000 SEK", detail: "Client payments and project revenue", percent: 100, color: "bg-emerald-500" },
  { label: "Money out", value: "25,800 SEK", detail: "Tools, hosting and operating costs", percent: 40, color: "bg-amber-500" },
  { label: "Net result", value: "38,200 SEK", detail: "Demo result before tax reserve", percent: 60, color: "bg-[#2E75BD]" },
];

export const taxPocket = {
  current: "31,240 SEK",
  target: "36,800 SEK",
  missing: "5,560 SEK",
  progress: 85,
  targetTab: "taxes",
};

export const financeHealth = {
  score: "92%",
  label: "Good",
  progress: 92,
  summary: "Most records are ready. Only 3 transactions and 2 receipts need attention.",
  breakdown: [
    { label: "CSV imported", value: "Done", status: "Done" as const },
    { label: "Receipts", value: "2 missing", status: "Missing receipt" as const },
    { label: "Transactions", value: "3 review", status: "Review" as const },
    { label: "VAT report", value: "Ready", status: "Ready" as const },
    { label: "Reports", value: "Draft", status: "Draft" as const },
  ],
};

export const backendInsights = [
  "Hosting costs increased 18% compared with last month.",
  "Software subscriptions increased 14% this month.",
  "3 recurring suppliers detected from transaction history.",
  "VAT estimate updated after latest CSV import.",
  "2 receipts are still missing before period close.",
];

export const outstandingInvoices = [
  { id: "overview-invoice-001", client: "Palo House", amount: "18,000 SEK", due: "Due Jul 02", status: "Pending" as const },
  { id: "overview-invoice-002", client: "Maison Vala", amount: "32,000 SEK", due: "Due Jun 15", status: "Overdue" as const },
];

export const activityItems = [
  { id: "activity-001", title: "Revolut CSV imported", detail: "42 rows processed for July.", meta: "Jul 01" },
  { id: "activity-002", title: "VAT draft updated", detail: "Input VAT changed after receipt matching.", meta: "Today" },
  { id: "activity-003", title: "Palo House payment posted", detail: "Invoice payment matched to CSV row.", meta: "Yesterday" },
];

export const importSteps = [
  "Upload CSV",
  "Map columns",
  "Detect duplicates",
  "Categorize transactions",
  "Review issues",
  "Create draft bookkeeping entries",
];

export const importPreviewRows = [
  {
    id: "row-001",
    typ: "CARD_PAYMENT",
    produkt: "Pro",
    startdatum: "2026-07-01",
    slutförtDatum: "2026-07-01",
    beskrivning: "OpenAI",
    belopp: "-48.80",
    avgift: "0.00",
    valuta: "SEK",
    state: "COMPLETED",
    saldo: "51,240.00",
  },
  {
    id: "row-002",
    typ: "BANK_TRANSFER",
    produkt: "Pro",
    startdatum: "2026-07-01",
    slutförtDatum: "2026-07-01",
    beskrivning: "Client payment Palo House",
    belopp: "18,000.00",
    avgift: "0.00",
    valuta: "SEK",
    state: "COMPLETED",
    saldo: "51,288.80",
  },
  {
    id: "row-003",
    typ: "CARD_PAYMENT",
    produkt: "Pro",
    startdatum: "2026-07-01",
    slutförtDatum: "2026-07-01",
    beskrivning: "One.com",
    belopp: "-349.00",
    avgift: "0.00",
    valuta: "SEK",
    state: "COMPLETED",
    saldo: "33,288.80",
  },
];

export const importMapping = [
  { source: "Typ", target: "transaction_type" },
  { source: "Startdatum", target: "booking_date" },
  { source: "Slutfört datum", target: "payment_date" },
  { source: "Beskrivning", target: "description" },
  { source: "Belopp", target: "gross_amount" },
  { source: "Avgift", target: "fee" },
  { source: "Valuta", target: "currency" },
  { source: "State", target: "import_status" },
  { source: "Saldo", target: "balance_after" },
];

export const importResult = [
  { label: "Rows detected", value: "42" },
  { label: "New transactions", value: "40" },
  { label: "Duplicates skipped", value: "2" },
  { label: "Auto categorized", value: "35" },
  { label: "Need review", value: "5" },
];

export const transactions: FinanceTransaction[] = [
  {
    id: "txn-001",
    source: "revolut_csv",
    externalId: "rvlt-001",
    transactionType: "expense",
    bookingDate: "2026-07-01",
    paymentDate: "2026-07-01",
    description: "OpenAI",
    grossAmount: -48.8,
    fee: 0,
    currency: "SEK",
    category: "Software",
    basAccount: "5420",
    vatRate: 25,
    vatAmount: 9.76,
    receiptStatus: "missing",
    aiConfidence: 94,
    status: "review",
  },
  {
    id: "txn-002",
    source: "revolut_csv",
    externalId: "rvlt-002",
    transactionType: "expense",
    bookingDate: "2026-07-01",
    paymentDate: "2026-07-01",
    description: "One.com",
    grossAmount: -349,
    fee: 0,
    currency: "SEK",
    category: "Hosting",
    basAccount: "6540",
    vatRate: 25,
    vatAmount: 69.8,
    receiptStatus: "matched",
    aiConfidence: 98,
    status: "ready",
  },
  {
    id: "txn-003",
    source: "revolut_csv",
    externalId: "rvlt-003",
    transactionType: "income",
    bookingDate: "2026-07-01",
    paymentDate: "2026-07-01",
    description: "Client payment Palo House",
    grossAmount: 18000,
    fee: 0,
    currency: "SEK",
    category: "Web project revenue",
    basAccount: "3041",
    vatRate: 25,
    vatAmount: 3600,
    receiptStatus: "matched",
    invoiceStatus: "matched",
    aiConfidence: 100,
    status: "posted",
  },
  {
    id: "txn-004",
    source: "revolut_csv",
    externalId: "rvlt-004",
    transactionType: "expense",
    bookingDate: "2026-07-02",
    paymentDate: "2026-07-02",
    description: "Adobe",
    grossAmount: -279,
    fee: 0,
    currency: "SEK",
    category: "Software",
    basAccount: "5420",
    vatRate: 25,
    vatAmount: 55.8,
    receiptStatus: "matched",
    aiConfidence: 97,
    status: "ready",
  },
  {
    id: "txn-005",
    source: "revolut_csv",
    externalId: "rvlt-005",
    transactionType: "expense",
    bookingDate: "2026-07-02",
    paymentDate: "2026-07-02",
    description: "Figma",
    grossAmount: -150,
    fee: 0,
    currency: "SEK",
    category: "Software",
    basAccount: "5420",
    vatRate: 25,
    vatAmount: 30,
    receiptStatus: "missing",
    aiConfidence: 88,
    status: "review",
  },
];

export const invoices: FinanceInvoice[] = [
  { id: "INV-1024", client: "Palo House", project: "Web project", amount: "18,000 SEK", vat: "3,600 SEK", dueDate: "2026-07-10", status: "Pending", matchedPayment: "Invoice matched" },
  { id: "INV-1025", client: "Northbound", project: "Strategy site", amount: "24,000 SEK", vat: "4,800 SEK", dueDate: "2026-06-21", status: "Paid", matchedPayment: "Matched Jun 21" },
  { id: "INV-1026", client: "Maison Vala", project: "Commerce concept", amount: "32,000 SEK", vat: "6,400 SEK", dueDate: "2026-06-15", status: "Overdue", matchedPayment: "Unmatched" },
];

export const expenses: FinanceExpense[] = [
  { id: "exp-001", supplier: "OpenAI", date: "2026-07-01", amount: "-48.80 SEK", category: "Software", basAccount: "5420", vat: "25%", receipt: "Missing", status: "Missing receipt" },
  { id: "exp-002", supplier: "One.com", date: "2026-07-01", amount: "-349 SEK", category: "Hosting", basAccount: "6540", vat: "25%", receipt: "Matched", status: "Ready" },
  { id: "exp-003", supplier: "Adobe", date: "2026-07-02", amount: "-279 SEK", category: "Software", basAccount: "5420", vat: "25%", receipt: "Matched", status: "Ready" },
  { id: "exp-004", supplier: "Cloudflare", date: "2026-07-03", amount: "-320 SEK", category: "Hosting / Domain", basAccount: "6540 / 6230", vat: "25%", receipt: "Matched", status: "Posted" },
];

export const supplierRules = [
  { supplier: "OpenAI", category: "Software", account: "5420", vat: "25%" },
  { supplier: "One.com", category: "Hosting", account: "6540", vat: "25%" },
  { supplier: "Adobe", category: "Software", account: "5420", vat: "25%" },
  { supplier: "Cloudflare", category: "Hosting / Domain", account: "6540 / 6230", vat: "25%" },
];

export const receipts: FinanceReceipt[] = [
  { id: "rec-001", filename: "Adobe.pdf", supplier: "Adobe", date: "2026-07-02", amount: "279 SEK", vat: "55.80 SEK", matchedTransaction: "Adobe", status: "Matched" },
  { id: "rec-002", filename: "Onecom_invoice.pdf", supplier: "One.com", date: "2026-07-01", amount: "349 SEK", vat: "69.80 SEK", matchedTransaction: "One.com", status: "Matched" },
  { id: "rec-003", filename: "OpenAI_receipt.png", supplier: "OpenAI", date: "2026-07-01", amount: "48.80 SEK", vat: "9.76 SEK", matchedTransaction: "Missing transaction match", status: "Review" },
  { id: "rec-004", filename: "Figma.pdf", supplier: "Figma", date: "2026-07-02", amount: "150 SEK", vat: "30 SEK", matchedTransaction: "Figma", status: "Review" },
];

export const bookkeepingChecklist = [
  { id: "book-check-001", title: "CSV imported", meta: "Jul 01", description: "Latest Revolut Pro file added.", status: "Done" as const },
  { id: "book-check-002", title: "Invoices registered", meta: "3 invoices", description: "Manual Revolut workflow tracked.", status: "Done" as const },
  { id: "book-check-003", title: "Payments matched", meta: "1 open match", description: "Maison Vala payment is still missing.", status: "Pending" as const },
  { id: "book-check-004", title: "Receipts uploaded", meta: "2 missing", description: "OpenAI and Figma need review.", status: "Review" as const },
  { id: "book-check-005", title: "VAT checked", meta: "Draft", description: "VAT report is ready for review.", status: "Ready" as const },
  { id: "book-check-006", title: "Journal entries reviewed", meta: "3 entries", description: "Draft entries prepared.", status: "Review" as const },
  { id: "book-check-007", title: "Reports generated", meta: "4 / 7 ready", description: "SIE and year-end support pending.", status: "Pending" as const },
];

export const journalEntries: JournalEntry[] = [
  { id: "journal-001", verificationNo: "V-2026-001", date: "2026-07-01", description: "Client payment Palo House", debitAccount: "1930 Bank account", creditAccount: "3041 Sales services Sweden", amount: "18,000 SEK", status: "Posted" },
  { id: "journal-002", verificationNo: "V-2026-002", date: "2026-07-01", description: "OpenAI software expense", debitAccount: "5420 Software / 2641 Input VAT", creditAccount: "1930 Bank account", amount: "48.80 SEK", status: "Review" },
  { id: "journal-003", verificationNo: "V-2026-003", date: "2026-07-01", description: "One.com hosting expense", debitAccount: "6540 IT services / 2641 Input VAT", creditAccount: "1930 Bank account", amount: "349 SEK", status: "Ready" },
];

export const basAccountSuggestions = [
  "3041 Sales services Sweden, 25% VAT",
  "2611 Output VAT 25%",
  "2641 Input VAT",
  "1930 Bank account",
  "5420 Software",
  "6540 IT services / hosting",
  "6230 Data communication / domain related costs",
];

export const vatSummary = {
  metrics: [
    { label: "Output VAT", value: "16,000 SEK", detail: "Sales VAT 25%" },
    { label: "Input VAT", value: "3,160 SEK", detail: "Deductible purchase VAT" },
    { label: "VAT to pay", value: "12,840 SEK", detail: "Draft VAT liability" },
    { label: "Next VAT deadline", value: "Aug 12, 2026", detail: "Demo deadline" },
  ],
  rows: [
    { label: "Sales excluding VAT", value: "64,000 SEK" },
    { label: "Output VAT 25%", value: "16,000 SEK" },
    { label: "Purchases excluding VAT", value: "12,640 SEK" },
    { label: "Input VAT", value: "3,160 SEK" },
    { label: "VAT to pay", value: "12,840 SEK" },
  ],
  boxes: [
    { box: "Box 05", description: "Taxable sales not included in other boxes", value: "64,000 SEK" },
    { box: "Box 10", description: "Output VAT 25%", value: "16,000 SEK" },
    { box: "Box 48", description: "Input VAT to deduct", value: "3,160 SEK" },
    { box: "Box 49", description: "VAT to pay / receive", value: "12,840 SEK" },
  ],
};

export const taxEstimate = {
  disclaimer: "This is an estimate only. Final tax depends on Swedish Tax Agency rules, deductions, own contributions and personal situation.",
  metrics: [
    { label: "Estimated profit", value: "274,000 SEK", detail: "Revenue YTD less expenses YTD" },
    { label: "Suggested tax reserve", value: "95,900 SEK", detail: "35% demo reserve" },
    { label: "Tax pocket balance", value: "82,400 SEK", detail: "Moms / Skatt pocket" },
    { label: "Reserve gap", value: "13,500 SEK", detail: "Suggested amount still missing" },
  ],
  calculation: [
    { label: "Revenue YTD", value: "412,000 SEK" },
    { label: "Expenses YTD", value: "138,000 SEK" },
    { label: "Estimated profit", value: "274,000 SEK" },
    { label: "Suggested reserve percentage", value: "35%" },
    { label: "Suggested amount to set aside", value: "95,900 SEK" },
    { label: "Already reserved", value: "82,400 SEK" },
    { label: "Missing reserve", value: "13,500 SEK" },
  ],
  monthlyPlan: [
    { month: "January", amount: "7,800 SEK", status: "reserved" },
    { month: "February", amount: "8,400 SEK", status: "reserved" },
    { month: "March", amount: "9,100 SEK", status: "reserved" },
    { month: "April", amount: "8,900 SEK", status: "reserved" },
    { month: "May", amount: "10,300 SEK", status: "reserved" },
    { month: "June", amount: "12,100 SEK", status: "behind" },
    { month: "July", amount: "12,600 SEK", status: "behind" },
    { month: "August", amount: "8,800 SEK", status: "upcoming" },
    { month: "September", amount: "8,800 SEK", status: "upcoming" },
    { month: "October", amount: "8,800 SEK", status: "upcoming" },
    { month: "November", amount: "8,800 SEK", status: "upcoming" },
    { month: "December", amount: "8,800 SEK", status: "upcoming" },
  ],
};

export const assets: FinanceAsset[] = [
  { id: "asset-001", asset: "Dell Latitude laptop", purchaseDate: "2026-02-12", purchaseAmount: "18,400 SEK", category: "Computer equipment", depreciationPeriod: "3 years", thisYearDepreciation: "3,067 SEK", bookValue: "15,333 SEK", status: "Active" },
  { id: "asset-002", asset: "Domain / website tools", purchaseDate: "2026-03-04", purchaseAmount: "6,800 SEK", category: "Digital tools", depreciationPeriod: "Direct / demo", thisYearDepreciation: "6,800 SEK", bookValue: "0 SEK", status: "Posted" },
  { id: "asset-003", asset: "Office equipment", purchaseDate: "2026-04-18", purchaseAmount: "4,900 SEK", category: "Office", depreciationPeriod: "1 year demo", thisYearDepreciation: "2,450 SEK", bookValue: "2,450 SEK", status: "Review" },
];

export const reports: FinanceReport[] = [
  { id: "report-001", title: "VAT report PDF", description: "Draft VAT summary for current period.", status: "Ready", action: "Download demo", icon: FileText },
  { id: "report-002", title: "Transaction export CSV", description: "All categorized Revolut transactions.", status: "Ready", action: "Download demo", icon: FileArchive },
  { id: "report-003", title: "Bookkeeping journal", description: "Verification rows for accounting review.", status: "Ready", action: "Download demo", icon: FileCheck2 },
  { id: "report-004", title: "General ledger", description: "BAS account movement by period.", status: "Draft", action: "Generate", icon: Archive },
  { id: "report-005", title: "Profit report", description: "Revenue, expenses and result.", status: "Ready", action: "Download demo", icon: CircleDollarSign },
  { id: "report-006", title: "Balance report", description: "Assets, liabilities and equity demo.", status: "Draft", action: "Generate", icon: Landmark },
  { id: "report-007", title: "SIE export", description: "Demo placeholder for future SIE file export.", status: "Pending", action: "Generate", icon: Upload },
  { id: "report-008", title: "Year-end / NE support", description: "Checklist and figures for NE preparation.", status: "Pending", action: "Generate", icon: Building2 },
];

export const reportStatus = {
  currentPeriod: "June 2026",
  reportsReady: "4 / 7",
  missingData: "2 receipts, 3 transactions need review",
};

export const financeSettings = {
  businessProfile: [
    { label: "Company name", value: "KWStudio" },
    { label: "Business type", value: "Enskild firma" },
    { label: "Currency", value: "SEK" },
    { label: "VAT registered", value: "Yes" },
    { label: "Accounting method", value: "Cash method demo" },
  ],
  importSettings: [
    { label: "Default source", value: "Revolut Pro CSV" },
    { label: "Duplicate detection", value: "Enabled" },
    { label: "Auto-categorization", value: "Enabled" },
  ],
  vatSettings: [
    { label: "Default VAT rate", value: "25%" },
    { label: "VAT period", value: "Monthly demo" },
  ],
  taxReserveSettings: [
    { label: "Suggested reserve percentage", value: "35%" },
    { label: "Tax pocket name", value: "Moms / Skatt" },
  ],
};

export const categoryRules = [
  { supplier: "OpenAI", category: "Software", basAccount: "5420", vat: "25%" },
  { supplier: "One.com", category: "Hosting", basAccount: "6540", vat: "25%" },
  { supplier: "Adobe", category: "Software", basAccount: "5420", vat: "25%" },
];

export const financeQuickActions = [
  { label: "Import CSV", icon: Upload },
  { label: "Add transaction", icon: Banknote },
  { label: "Upload receipt", icon: ReceiptText },
  { label: "Generate VAT report", icon: FileText },
];

export const financeKpiGroups = {
  transactions: [
    { label: "Total imported", value: "42", detail: "From latest CSV" },
    { label: "Needs review", value: "3", detail: "Confidence below threshold" },
    { label: "Missing receipt", value: "2", detail: "Receipt file required" },
    { label: "Ready to post", value: "35", detail: "Categorized and checked" },
  ],
  invoices: [
    { label: "Draft", value: "1", detail: "Invoice being prepared" },
    { label: "Sent", value: "1", detail: "Awaiting payment" },
    { label: "Paid", value: "1", detail: "Matched in CSV" },
    { label: "Overdue", value: "1", detail: "Needs reminder" },
  ],
  expenses: [
    { label: "Expenses this month", value: "1,146 SEK", detail: "Demo supplier spend" },
    { label: "Recurring suppliers", value: "4", detail: "Rules recognized" },
    { label: "Missing receipts", value: "2", detail: "OpenAI and Figma" },
    { label: "Deductible VAT", value: "229 SEK", detail: "Input VAT estimate" },
  ],
  ownerExpenses: [
    { label: "Outstanding reimbursements", value: "0 SEK", detail: "Posted owner expenses not yet reimbursed" },
    { label: "Open owner expenses", value: "0", detail: "Draft, posted or partially reimbursed" },
    { label: "Reimbursed this month", value: "0 SEK", detail: "Total reimbursed amount in selected period" },
    { label: "Items with receipt", value: "0", detail: "Owner expenses linked to uploaded receipts" },
  ],
  receipts: [
    { label: "Uploaded receipts", value: "4", detail: "PDF, JPG or PNG" },
    { label: "Matched", value: "2", detail: "Connected to transactions" },
    { label: "Missing", value: "2", detail: "Expected from CSV" },
    { label: "Needs review", value: "2", detail: "Extraction check" },
  ],
  bookkeeping: [
    { label: "Draft entries", value: "6", detail: "Created from CSV rows" },
    { label: "Posted entries", value: "18", detail: "Current period demo" },
    { label: "Needs review", value: "3", detail: "Before final posting" },
    { label: "Current period completion", value: "82%", detail: "June 2026" },
  ],
  assets: [
    { label: "Registered assets", value: "3", detail: "Current demo register" },
    { label: "Total purchase value", value: "30,100 SEK", detail: "Including equipment" },
    { label: "This year depreciation", value: "12,317 SEK", detail: "Demo calculation" },
    { label: "Remaining value", value: "17,783 SEK", detail: "Estimated book value" },
  ],
};

export const systemSuggestion = {
  suggestedCategory: "Software",
  suggestedBasAccount: "5420",
  suggestedVatRate: "25%",
  confidence: "94%",
};

export const emptyStateCopy = {
  demoOnly: "Connect VITE_KWSTUDIO_API_URL to load live finance data from the API Worker.",
  csv: "Revolut Pro has no API/webhooks in this setup, so Finance is built around monthly CSV imports.",
  tax: "This is not legal, tax or accounting advice. Verify all figures before submission.",
};

export const financeHeroNotes = [
  { icon: CheckCircle2, title: "CSV-first workflow", detail: "Monthly Revolut Pro files become reviewable finance rows." },
  { icon: CheckCircle2, title: "Rule suggestions", detail: "Supplier rules propose category, BAS account and VAT." },
  { icon: AlertTriangle, title: "Review before posting", detail: "Anything uncertain stays in draft or review state." },
  { icon: Settings, title: "Static demo data", detail: "Designed so real parsing can be wired in later." },
];
