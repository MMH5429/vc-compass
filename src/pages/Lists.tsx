import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Download, X, FileJson, List as ListIcon, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { mockCompanies } from '@/data/mockCompanies';
import type { CompanyList } from '@/lib/types';
import { toast } from 'sonner';

const listAvatarColors = [
  'from-blue-600 to-blue-400',
  'from-violet-600 to-violet-400',
  'from-emerald-600 to-emerald-400',
  'from-amber-600 to-amber-400',
  'from-pink-600 to-pink-400',
  'from-cyan-600 to-cyan-400',
];

const companyAvatarColor = [
  'bg-blue-500/20 text-blue-400',
  'bg-violet-500/20 text-violet-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-amber-500/20 text-amber-400',
  'bg-pink-500/20 text-pink-400',
  'bg-cyan-500/20 text-cyan-400',
];

const stageColor: Record<string, string> = {
  'Seed': 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  'Series A': 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  'Series B': 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  'Series C': 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
};

export default function Lists() {
  const [lists, setLists] = useLocalStorage<CompanyList[]>('vc-lists', []);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const createList = () => {
    if (!newListName.trim()) return;
    const list: CompanyList = {
      id: Date.now().toString(),
      name: newListName,
      description: newListDesc,
      companyIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLists((prev) => [...prev, list]);
    setNewListName('');
    setNewListDesc('');
    setDialogOpen(false);
    toast.success('List created');
  };

  const deleteList = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    toast.success('List deleted');
  };

  const removeFromList = (listId: string, companyId: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, companyIds: l.companyIds.filter((c) => c !== companyId) }
          : l
      )
    );
  };

  const exportList = (list: CompanyList, format: 'csv' | 'json') => {
    const companies = list.companyIds
      .map((cid) => mockCompanies.find((c) => c.id === cid))
      .filter(Boolean);

    let content: string;
    let mime: string;
    let ext: string;

    if (format === 'json') {
      content = JSON.stringify(companies, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      const headers = 'Name,Domain,Industry,Stage,Location,Funding\n';
      const rows = companies
        .map((c) => `"${c!.name}","${c!.domain}","${c!.industry}","${c!.stage}","${c!.location}","${c!.funding}"`)
        .join('\n');
      content = headers + rows;
      mime = 'text/csv';
      ext = 'csv';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${ext.toUpperCase()}`);
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="border-b border-border pb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Company{' '}
            <span className="text-primary">Lists</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organise companies into custom collections for tracking and export.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 mt-1">
              <Plus className="h-4 w-4 mr-2" /> New List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Create a new list</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  List name
                </label>
                <Input
                  placeholder="e.g. Climate Tech Watch"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createList()}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Description <span className="normal-case font-normal">(optional)</span>
                </label>
                <Input
                  placeholder="What's this list for?"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                />
              </div>
              <Button onClick={createList} className="w-full mt-1" disabled={!newListName.trim()}>
                <Plus className="h-4 w-4 mr-2" /> Create list
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      {lists.length > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{lists.length}</span>{' '}
            {lists.length === 1 ? 'list' : 'lists'}
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="font-semibold text-foreground">
              {new Set(lists.flatMap((l) => l.companyIds)).size}
            </span>{' '}
            unique companies tracked
          </span>
        </div>
      )}

      {/* Empty state */}
      {lists.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border border-dashed rounded-xl">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ListIcon className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <h3 className="font-display font-semibold text-lg mb-1">No lists yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Create a list to start grouping companies by theme, stage, or investment thesis.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create your first list
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {lists.map((list, listIdx) => {
            const companies = list.companyIds
              .map((cid) => mockCompanies.find((c) => c.id === cid))
              .filter(Boolean);
            const gradient = listAvatarColors[listIdx % listAvatarColors.length];

            return (
              <div key={list.id} className="border border-border rounded-xl bg-card overflow-hidden">

                {/* List header */}
                <div className="flex items-center gap-4 p-4 border-b border-border">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                    <ListIcon className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-semibold text-base">{list.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                        {list.companyIds.length} {list.companyIds.length === 1 ? 'company' : 'companies'}
                      </span>
                    </div>
                    {list.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{list.description}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      Updated {new Date(list.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportList(list, 'csv')}
                      className="h-8 gap-1.5 text-xs"
                      title="Export CSV"
                    >
                      <Download className="h-3 w-3" /> CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportList(list, 'json')}
                      className="h-8 gap-1.5 text-xs"
                      title="Export JSON"
                    >
                      <FileJson className="h-3 w-3" /> JSON
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteList(list.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete list"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Company rows */}
                {companies.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Building2 className="h-5 w-5 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      No companies yet — add them from a company profile.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {companies.map((company, cIdx) => (
                      <div
                        key={company!.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors group"
                      >
                        <div className={`h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${companyAvatarColor[cIdx % companyAvatarColor.length]}`}>
                          {company!.name.charAt(0)}
                        </div>
                        <Link
                          to={`/companies/${company!.id}`}
                          className="flex-1 min-w-0 flex items-center gap-2 group/link"
                        >
                          <span className="text-sm font-medium group-hover/link:text-primary transition-colors truncate">
                            {company!.name}
                          </span>
                          <span className="text-xs text-muted-foreground hidden sm:block truncate">
                            {company!.industry}
                          </span>
                        </Link>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold shrink-0 hidden sm:inline-flex ${stageColor[company!.stage] || 'bg-muted text-muted-foreground'}`}>
                          {company!.stage}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground shrink-0 hidden md:block">
                          {company!.funding}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromList(list.id, company!.id)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          title="Remove from list"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
