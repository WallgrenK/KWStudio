export type ScbLeadFinderFilters = {
  county?: string;
  municipality?: string;
  industry?: string;
  companyStatus?: string;
  taxStatus?: string;
  employeeRange?: string;
  registrationPeriod?: string;
  adStatus?: string;
  legalForm?: string;
  excludedLegalForms?: string[];
};

export type ScbCategory = {
  Kategori: string;
  Kod: string[];
};

export type ScbVariable = {
  Variabel: string;
  Operator: "Mellan";
  Varde1: string;
  Varde2: string;
};

export type ScbRequestBody = {
  "Företagsstatus": string;
  "Registreringsstatus": string;
  Kategorier: ScbCategory[];
  variabler?: ScbVariable[];
};

const municipalityCodes: Record<string, string> = {
  solna: "0184",
  stockholm: "0180",
  ekero: "0125",
  vallentuna: "0115",
  osteraker: "0117",
  uppsala: "0380",
  goteborg: "1480",
  malmo: "1280",
  lund: "1281",
  helsingborg: "1283",
  vasteras: "1980",
  orebro: "1880",
  linkoping: "0580",
  norrkoping: "0581",
  jonkoping: "0680",
  umea: "2480",
};

const countyCodes: Record<string, string> = {
  stockholm: "01",
  uppsala: "03",
  sodermanland: "04",
  ostergotland: "05",
  skane: "12",
  vastra_gotaland: "14",
  vastmanland: "19",
  vasterbotten: "24",
};

const industryCodes: Record<string, string> = {
  retail_ecommerce: "47",
  restaurants_cafes: "56",
  construction: "41",
  real_estate: "68",
  consulting: "70",
  it_software: "62",
  health_wellness: "86",
  beauty_personal_services: "96",
  manufacturing: "10",
};

const employeeRangeCodes: Record<string, string[]> = {
  "0": ["1"],
  "1_4": ["2"],
  "5_9": ["3"],
  "10_19": ["4"],
  "20_49": ["5"],
  "50_99": ["6"],
};

const registrationPeriodDays: Record<string, number> = {
  last_30_days: 30,
  last_90_days: 90,
  last_180_days: 180,
  last_365_days: 365,
};


function addCategory(categories: ScbCategory[], category: string, codes: string[] | undefined) {
  if (!codes || codes.length === 0) return;
  categories.push({ Kategori: category, Kod: codes });
}

export function formatScbDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function buildScbRequest(filters: ScbLeadFinderFilters): ScbRequestBody {
  const categories: ScbCategory[] = [];
  const variables: ScbVariable[] = [];
  const companyStatus = filters.companyStatus === "active" ? "1" : "1";

  const municipalityCode = filters.municipality ? municipalityCodes[filters.municipality] : undefined;
  const countyCode = filters.county ? countyCodes[filters.county] : undefined;

  addCategory(categories, "SätesKommun", municipalityCode ? [municipalityCode] : undefined);
  if (!municipalityCode) {
    addCategory(categories, "SätesLän", countyCode ? [countyCode] : undefined);
  }

  const industryCode = filters.industry ? industryCodes[filters.industry] : undefined;
  addCategory(categories, "2-siffrig bransch 1", industryCode ? [industryCode] : undefined);

  const employeeCodes = filters.employeeRange ? employeeRangeCodes[filters.employeeRange] : undefined;
  addCategory(categories, "Anställda", employeeCodes);

  if (filters.taxStatus === "f_tax_approved") {
    addCategory(categories, "F-skattstatus", ["1"]);
  }
  if (filters.taxStatus === "vat_registered") {
    addCategory(categories, "Momsstatus", ["1"]);
  }

  if (filters.adStatus === "accepts_advertising") {
    addCategory(categories, "Reklam", ["11", "12", "13"]);
  }
  if (filters.adStatus === "advertising_blocked") {
    addCategory(categories, "Reklam", ["21", "22", "23"]);
  }

  const periodDays = filters.registrationPeriod ? registrationPeriodDays[filters.registrationPeriod] : undefined;
  if (periodDays) {
    const toDate = new Date();
    const fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - periodDays);
    variables.push({
      Variabel: "Registreringsdatum",
      Operator: "Mellan",
      Varde1: formatScbDate(fromDate),
      Varde2: formatScbDate(toDate),
    });
  }

  const body: ScbRequestBody = {
    "Företagsstatus": companyStatus,
    "Registreringsstatus": "1",
    Kategorier: categories,
  };

  if (variables.length > 0) {
    body.variabler = variables;
  }

  return body;
}

// Example: buildScbRequest({ municipality: "solna", industry: "retail_ecommerce", employeeRange: "1_4", registrationPeriod: "last_90_days", taxStatus: "f_tax_approved" })
// includes SätesKommun 0184, 2-siffrig bransch 1 = 47, Juridisk form = 10/31/49/51, Anställda = 2, F-skattstatus = 1, and a Registreringsdatum range in YYYYMMDD format.
