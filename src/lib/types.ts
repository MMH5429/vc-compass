export interface Company {
  id: string;
  name: string;
  domain: string;
  description: string;
  industry: string;
  stage: string;
  founded: number;
  employees: string;
  location: string;
  funding: string;
  tags: string[];
  signals: Signal[];
}

export interface Signal {
  type: 'hiring' | 'product' | 'funding' | 'partnership' | 'press' | 'tech';
  title: string;
  date: string;
  description: string;
}

export interface CompanyList {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  createdAt: string;
}

export interface SearchFilters {
  industry?: string;
  stage?: string;
}

export interface EnrichmentResult {
  companyId: string;
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: DerivedSignal[];
  sources: EnrichmentSource[];
  enrichedAt: string;
  // Extended fields populated by real API enrichment
  logoUrl?: string;
  techStack?: string[];
  employeeCount?: number;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    crunchbase?: string;
  };
  dataSource?: 'clearbit' | 'mock';
}

export interface DerivedSignal {
  signal: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface EnrichmentSource {
  url: string;
  scrapedAt: string;
}

export interface Note {
  id: string;
  companyId: string;
  content: string;
  createdAt: string;
}
