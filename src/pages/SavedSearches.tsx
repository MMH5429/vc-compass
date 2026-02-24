import { useNavigate } from 'react-router-dom';
import { Trash2, Search, Play, Clock, Filter, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SavedSearch } from '@/lib/types';
import { toast } from 'sonner';

const stageColor: Record<string, string> = {
  'Seed': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  'Series A': 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  'Series B': 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  'Series C': 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
};

export default function SavedSearches() {
  const [savedSearches, setSavedSearches] = useLocalStorage<SavedSearch[]>('vc-saved-searches', []);
  const navigate = useNavigate();

  const deleteSearch = (id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
    toast.success('Search deleted');
  };

  const runSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.query) params.set('q', search.query);
    if (search.filters.industry && search.filters.industry !== 'all')
      params.set('industry', search.filters.industry);
    if (search.filters.stage && search.filters.stage !== 'all')
      params.set('stage', search.filters.stage);
    navigate(`/companies?${params.toString()}`);
  };

  const hasFilters = (search: SavedSearch) =>
    (search.filters.industry && search.filters.industry !== 'all') ||
    (search.filters.stage && search.filters.stage !== 'all');

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Saved{' '}
          <span className="text-primary">Searches</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Re-run previous search queries and filters instantly.
        </p>
      </div>

      {/* Stats */}
      {savedSearches.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{savedSearches.length}</span>{' '}
          saved {savedSearches.length === 1 ? 'search' : 'searches'}
        </p>
      )}

      {/* Empty state */}
      {savedSearches.length === 0 ? (
        <div className="text-center py-24 bg-card border border-dashed border-border rounded-xl">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <h3 className="font-display font-semibold text-lg mb-1">No saved searches</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Head to the Companies page, set up a search or filter, then click{' '}
            <span className="font-semibold text-foreground">Save Search</span> to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((search, idx) => (
            <div
              key={search.id}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/25 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="h-4 w-4 text-primary" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display font-semibold text-sm leading-tight">{search.name}</p>
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => runSearch(search)}
                        className="h-8 gap-1.5 text-xs"
                      >
                        <Play className="h-3 w-3" /> Run
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSearch(search.id)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Query + filter chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {search.query && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border text-xs">
                        <Search className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-foreground">"{search.query}"</span>
                      </span>
                    )}
                    {search.filters.industry && search.filters.industry !== 'all' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
                        <Filter className="h-2.5 w-2.5" />
                        {search.filters.industry}
                      </span>
                    )}
                    {search.filters.stage && search.filters.stage !== 'all' && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${stageColor[search.filters.stage] || 'bg-muted text-muted-foreground border border-border'}`}>
                        <Tag className="h-2.5 w-2.5" />
                        {search.filters.stage}
                      </span>
                    )}
                    {!search.query && !hasFilters(search) && (
                      <span className="text-xs text-muted-foreground italic">All companies</span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                    <Clock className="h-3 w-3" />
                    Saved {new Date(search.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
