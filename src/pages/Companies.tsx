import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, ChevronLeft, ChevronRight, Bookmark,
  ChevronUp, ChevronDown, ChevronsUpDown, X, SlidersHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockCompanies } from '@/data/mockCompanies';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SavedSearch, SearchFilters } from '@/lib/types';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;
const industries = [...new Set(mockCompanies.map((c) => c.industry))].sort();
const stages = [...new Set(mockCompanies.map((c) => c.stage))].sort();

const signalTypeColor: Record<string, string> = {
  hiring: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  product: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  funding: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  partnership: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  press: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  tech: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
};

const stageColor: Record<string, string> = {
  'Seed': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  'Series A': 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  'Series B': 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  'Series C': 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
};

const avatarColor = [
  'bg-blue-500/20 text-blue-400',
  'bg-violet-500/20 text-violet-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-pink-500/20 text-pink-400',
  'bg-cyan-500/20 text-cyan-400',
];

const COLUMNS = [
  { key: 'name', label: 'Company' },
  { key: 'industry', label: 'Industry' },
  { key: 'stage', label: 'Stage' },
  { key: 'location', label: 'Location' },
  { key: 'funding', label: 'Funding' },
];

export default function Companies() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    industry: searchParams.get('industry') || undefined,
    stage: searchParams.get('stage') || undefined,
  });

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setFilters({
      industry: searchParams.get('industry') || undefined,
      stage: searchParams.get('stage') || undefined,
    });
    setPage(1);
  }, [searchParams]);

  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [savedSearches, setSavedSearches] = useLocalStorage<SavedSearch[]>('vc-saved-searches', []);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let result = mockCompanies.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      const matchesIndustry =
        !filters.industry || filters.industry === 'all' || c.industry === filters.industry;
      const matchesStage =
        !filters.stage || filters.stage === 'all' || c.stage === filters.stage;
      return matchesQuery && matchesIndustry && matchesStage;
    });

    result.sort((a, b) => {
      const aVal = String(a[sortField as keyof typeof a] ?? '');
      const bVal = String(b[sortField as keyof typeof b] ?? '');
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

    return result;
  }, [query, filters, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const clearFilter = (key: keyof SearchFilters) => {
    setFilters((f) => ({ ...f, [key]: undefined }));
    setPage(1);
  };

  const hasActiveFilters =
    (filters.industry && filters.industry !== 'all') ||
    (filters.stage && filters.stage !== 'all');

  const saveSearch = () => {
    const search: SavedSearch = {
      id: Date.now().toString(),
      name: query || 'All companies',
      query,
      filters,
      createdAt: new Date().toISOString(),
    };
    setSavedSearches((prev) => [...prev, search]);
    toast.success('Search saved');
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronsUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="border-b border-border pb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Venture{' '}
            <span className="text-primary">Companies</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover, filter, and track venture-backed companies in your pipeline.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={saveSearch} className="shrink-0 mt-1">
          <Bookmark className="h-3.5 w-3.5 mr-2" />
          Save Search
        </Button>
      </div>

      {/* Search + Filters toolbar */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies, tags, descriptions…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="pl-9 bg-background"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>

          <Select
            value={filters.industry || 'all'}
            onValueChange={(v) => { setFilters((f) => ({ ...f, industry: v })); setPage(1); }}
          >
            <SelectTrigger className="w-44 bg-background">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map((i) => (
                <SelectItem key={i} value={i}>{i}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.stage || 'all'}
            onValueChange={(v) => { setFilters((f) => ({ ...f, stage: v })); setPage(1); }}
          >
            <SelectTrigger className="w-36 bg-background">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {filters.industry && filters.industry !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                {filters.industry}
                <button onClick={() => clearFilter('industry')} className="hover:text-primary/60 transition-colors">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}
            {filters.stage && filters.stage !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                {filters.stage}
                <button onClick={() => clearFilter('stage')} className="hover:text-primary/60 transition-colors">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}
            <button
              onClick={() => { setFilters({}); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
          {filtered.length === 1 ? 'company' : 'companies'} found
        </p>
        {totalPages > 1 && (
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    <SortIcon field={col.key} />
                  </span>
                </th>
              ))}
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                Signals
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((company, idx) => (
              <tr
                key={company.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors group"
                onClick={() => navigate(`/companies/${company.id}`)}
              >
                {/* Company */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor[idx % avatarColor.length]}`}>
                      {company.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {company.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{company.domain}</p>
                    </div>
                  </div>
                </td>

                {/* Industry */}
                <td className="px-4 py-3.5">
                  <span className="text-sm text-muted-foreground">{company.industry}</span>
                </td>

                {/* Stage */}
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${stageColor[company.stage] || 'bg-muted text-muted-foreground'}`}>
                    {company.stage}
                  </span>
                </td>

                {/* Location */}
                <td className="px-4 py-3.5">
                  <span className="text-sm text-muted-foreground">{company.location}</span>
                </td>

                {/* Funding */}
                <td className="px-4 py-3.5">
                  <span className="text-sm font-mono font-semibold text-foreground">{company.funding}</span>
                </td>

                {/* Signals */}
                <td className="px-4 py-3.5">
                  <div className="flex gap-1 flex-wrap">
                    {company.signals.slice(0, 2).map((s, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${signalTypeColor[s.type] || 'bg-muted text-muted-foreground'}`}
                      >
                        {s.type}
                      </span>
                    ))}
                    {company.signals.length > 2 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-muted border border-border">
                        +{company.signals.length - 2}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-20 text-center">
                  <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No companies match your search</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters or search term</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
                className="h-8 w-8 p-0 text-xs"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
