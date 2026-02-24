import type { EnrichmentResult, DerivedSignal, EnrichmentSource } from './types';

// ─────────────────────────────────────────────────────────────
//  Error types
// ─────────────────────────────────────────────────────────────

export type EnrichmentErrorCode =
  | 'NO_API_KEY'       // No key configured in env
  | 'INVALID_API_KEY'  // 401 – key is wrong
  | 'NOT_FOUND'        // 404 – domain not in database
  | 'RATE_LIMITED'     // 402 / 429 – quota exceeded
  | 'API_ERROR';       // Anything else

export class EnrichmentApiError extends Error {
  constructor(public code: EnrichmentErrorCode, message: string) {
    super(message);
    this.name = 'EnrichmentApiError';
  }
}

// ─────────────────────────────────────────────────────────────
//  Clearbit Company Enrichment
//  Docs: https://dashboard.clearbit.com/docs#enrichment-api-company-api
//  Key:  VITE_CLEARBIT_API_KEY
// ─────────────────────────────────────────────────────────────

interface ClearbitCompany {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  foundedYear: number | null;
  employees: number | null;
  employeesRange: string | null;
  location: string | null;
  logo: string | null;
  url: string | null;
  category: {
    sector: string | null;
    industryGroup: string | null;
    industry: string | null;
    subIndustry: string | null;
  } | null;
  tags: string[] | null;
  tech: string[] | null;
  techCategories: string[] | null;
  linkedin: { handle: string | null } | null;
  twitter: { handle: string | null } | null;
  crunchbase: { handle: string | null } | null;
  metrics: {
    raised: number | null;
    employees: number | null;
    employeesRange: string | null;
  } | null;
  site: {
    phoneNumbers: string[] | null;
    emailAddresses: string[] | null;
  } | null;
}

async function enrichWithClearbit(
  domain: string,
  companyId: string
): Promise<EnrichmentResult> {
  const apiKey = import.meta.env.VITE_CLEARBIT_API_KEY;

  if (!apiKey) {
    throw new EnrichmentApiError('NO_API_KEY', 'VITE_CLEARBIT_API_KEY is not set');
  }

  const response = await fetch(
    `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status === 401) {
    throw new EnrichmentApiError('INVALID_API_KEY', 'Clearbit API key is invalid or expired');
  }
  if (response.status === 404) {
    throw new EnrichmentApiError('NOT_FOUND', `No Clearbit data found for domain: ${domain}`);
  }
  if (response.status === 402 || response.status === 429) {
    throw new EnrichmentApiError('RATE_LIMITED', 'Clearbit rate limit reached. Try again later.');
  }
  if (!response.ok) {
    throw new EnrichmentApiError('API_ERROR', `Clearbit returned ${response.status}`);
  }

  const data: ClearbitCompany = await response.json();
  return mapClearbitToEnrichment(data, companyId);
}

function mapClearbitToEnrichment(
  data: ClearbitCompany,
  companyId: string
): EnrichmentResult {
  const tech = data.tech ?? [];
  const tags = data.tags ?? [];
  const category = data.category;

  // Summary
  const summary =
    data.description
      ? data.description
      : `${data.name} is a company${data.location ? ` based in ${data.location}` : ''}.${
          category?.industry ? ` They operate in the ${category.industry} sector.` : ''
        }`;

  // What they do
  const whatTheyDo: string[] = [];
  if (category?.industry) {
    whatTheyDo.push(`Operates in the ${category.industry} sector${category.subIndustry ? ` — ${category.subIndustry}` : ''}`);
  }
  if (data.employees || data.employeesRange) {
    whatTheyDo.push(`Team of ${data.employees?.toLocaleString() ?? data.employeesRange} employees`);
  }
  if (data.foundedYear) {
    whatTheyDo.push(`Founded in ${data.foundedYear}`);
  }
  if (data.location) {
    whatTheyDo.push(`Headquartered in ${data.location}`);
  }
  if (data.metrics?.raised) {
    const raisedM = (data.metrics.raised / 1_000_000).toFixed(1);
    whatTheyDo.push(`Has raised $${raisedM}M in total funding`);
  }
  if (tech.length > 0) {
    whatTheyDo.push(`Tech stack includes ${tech.slice(0, 6).join(', ')}`);
  }

  // Keywords
  const keywords = [
    ...tags,
    ...(category?.industry ? [category.industry] : []),
    ...(category?.sector ? [category.sector] : []),
    ...tech.slice(0, 8),
  ].filter(Boolean);

  // Derived signals
  const signals: DerivedSignal[] = [];
  if (tech.length > 15) {
    signals.push({ signal: `Large tech footprint — ${tech.length} technologies detected`, confidence: 'high' });
  } else if (tech.length > 5) {
    signals.push({ signal: `Moderate tech footprint — ${tech.length} technologies detected`, confidence: 'medium' });
  }
  if (data.linkedin?.handle) {
    signals.push({ signal: 'Active LinkedIn company page confirmed', confidence: 'high' });
  }
  if (data.twitter?.handle) {
    signals.push({ signal: 'Twitter/X presence detected', confidence: 'medium' });
  }
  if (data.crunchbase?.handle) {
    signals.push({ signal: 'Crunchbase profile exists — funding history trackable', confidence: 'high' });
  }
  if ((data.metrics?.raised ?? 0) > 10_000_000) {
    signals.push({ signal: 'Significant venture funding on record', confidence: 'high' });
  }
  if ((data.employees ?? 0) > 200) {
    signals.push({ signal: 'Headcount suggests growth-stage or later company', confidence: 'medium' });
  }
  if (data.site?.emailAddresses?.length) {
    signals.push({ signal: 'Public contact emails found on website', confidence: 'low' });
  }

  // Sources
  const sources: EnrichmentSource[] = [
    { url: `https://${data.domain}`, scrapedAt: new Date().toISOString() },
    { url: 'https://clearbit.com', scrapedAt: new Date().toISOString() },
  ];
  if (data.crunchbase?.handle) {
    sources.push({
      url: `https://www.crunchbase.com/organization/${data.crunchbase.handle}`,
      scrapedAt: new Date().toISOString(),
    });
  }
  if (data.linkedin?.handle) {
    sources.push({
      url: `https://www.linkedin.com/${data.linkedin.handle}`,
      scrapedAt: new Date().toISOString(),
    });
  }
  if (data.twitter?.handle) {
    sources.push({
      url: `https://twitter.com/${data.twitter.handle}`,
      scrapedAt: new Date().toISOString(),
    });
  }

  return {
    companyId,
    summary,
    whatTheyDo,
    keywords: [...new Set(keywords)],
    signals,
    sources,
    enrichedAt: new Date().toISOString(),
    // Extended fields
    logoUrl: data.logo ?? undefined,
    techStack: tech.length > 0 ? tech : undefined,
    employeeCount: data.employees ?? undefined,
    socialProfiles: {
      linkedin: data.linkedin?.handle
        ? `https://www.linkedin.com/${data.linkedin.handle}`
        : undefined,
      twitter: data.twitter?.handle
        ? `https://twitter.com/${data.twitter.handle}`
        : undefined,
      crunchbase: data.crunchbase?.handle
        ? `https://www.crunchbase.com/organization/${data.crunchbase.handle}`
        : undefined,
    },
    dataSource: 'clearbit',
  };
}

// ─────────────────────────────────────────────────────────────
//  Hunter.io Domain Search  (bonus signal: email patterns)
//  Docs: https://hunter.io/api-documentation/v2#domain-search
//  Key:  VITE_HUNTER_API_KEY
//
//  Add calls to this function inside enrichCompany() below
//  if you want Hunter data layered on top of Clearbit.
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchHunterSignals(domain: string): Promise<DerivedSignal[]> {
  const apiKey = import.meta.env.VITE_HUNTER_API_KEY;
  if (!apiKey) return [];

  const response = await fetch(
    `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&limit=1&api_key=${apiKey}`
  );
  if (!response.ok) return [];

  const data = await response.json();
  const signals: DerivedSignal[] = [];

  const emailCount: number = data?.data?.emails?.length ?? 0;
  const pattern: string | null = data?.data?.pattern ?? null;

  if (emailCount > 0) {
    signals.push({
      signal: `${emailCount} professional email addresses indexed by Hunter.io`,
      confidence: 'high',
    });
  }
  if (pattern) {
    signals.push({
      signal: `Email pattern detected: ${pattern} — team is reachable`,
      confidence: 'medium',
    });
  }

  return signals;
}

// ─────────────────────────────────────────────────────────────
//  Public entry point
// ─────────────────────────────────────────────────────────────

export async function enrichCompany(
  domain: string,
  companyId: string
): Promise<EnrichmentResult> {
  // Primary: Clearbit
  // To add more sources, call them here and merge results.
  return enrichWithClearbit(domain, companyId);
}

// ─────────────────────────────────────────────────────────────
//  Helper — checks which keys are configured, returns status
// ─────────────────────────────────────────────────────────────

export function getApiKeyStatus(): {
  clearbit: boolean;
  hunter: boolean;
} {
  return {
    clearbit: !!import.meta.env.VITE_CLEARBIT_API_KEY,
    hunter: !!import.meta.env.VITE_HUNTER_API_KEY,
  };
}
